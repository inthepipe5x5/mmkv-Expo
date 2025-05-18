import defaultSession, { session } from "@/constants/sessionDefaults";
import { createContext, useCallback, useContext, useMemo, useReducer, useState } from "react";
// import { ImmerReducer } from "use-immer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./SupabaseProvider";
import { useStorageContext } from "./StorageProvider";
import supabase from "@/lib/supabase/supabase";
import { processUserProfile } from "@/lib/supabase/session";
import { Database } from "@/lib/supabase/dbTypes";
import defaultUserPreferences from "@/constants/preferences";
import { useMMKVObject } from "react-native-mmkv";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { createHouseholdWithInventories, getHouseholdAndInventoryTemplates } from "@/lib/supabase/register";

type AccessLevel = Database["public"]["Enums"]["role_access"];
type HouseholdTuple = [household_id: string, access_level: AccessLevel, invite_accepted: boolean];
type UserHouseholdResponseObject = Database["public"]["Tables"]["user_households"]["Row"];
type currentProfile = Partial<Database["public"]["Tables"]["profiles"]["Row"]>;

// Define the context value type to match the value you provide
type UserHouseholdsContextType = {
    householdList: HouseholdTuple[];
    setHouseholdList: React.Dispatch<React.SetStateAction<HouseholdTuple[]>>;
    currentProfile: currentProfile | null;
    setCurrentProfile: React.Dispatch<React.SetStateAction<currentProfile | null>>;
    // userHouseholds: HouseholdTuple[];
    // profiles: any;
};

export const UserHouseholdsContext = createContext<UserHouseholdsContextType | null>(null);

export const UserHouseholdsProvider = ({ children }: { children: React.ReactNode }) => {
    const { cache } = useStorageContext();
    const { authenticated, session, authUser } = useAuth();
    const queryClient = useQueryClient();
    //#region state
    const [householdList, setHouseholdList] = useState<HouseholdTuple[]>([]);
    const [currentProfile, setCurrentProfile] = useMMKVObject<currentProfile | null>("currentProfile", cache.storage);
    //#endregion

    //#region keys

    //memo-ized query keys that are derived from the session and authUser
    const queryKeys = useMemo(() => {
        const userKey = { user_id: !!session?.user ? session?.user?.id : "anon" }

        const queryKeys = {
            userHouseholds: ["userHouseholds", userKey],
            profiles: ["profiles", userKey],
            households: ["households", userKey],
            sessionResources: ["sessionResources", userKey],
        }

        if (__DEV__) {
            console.log("UserHouseholdsProvider queryKeys", JSON.stringify(queryKeys, null, 2));
        }
        // invalidate all queries when the session changes
        queryClient.invalidateQueries({ queryKey: Object.values(queryKeys) });
        return queryKeys;
    }, [session, queryClient]);
    // #endregion keys

    //#region methods
    const sortResources = useCallback((
        data: { [key: string]: any }[],
        options: { key: string, ascending: boolean } = { key: "id", ascending: true }) => {
        if (data.length === 0) return data;

        // Check if the key exists in the first object of the array
        // If not, find a key that includes "id" or "name"
        const sortKey = options.key in data[0] ? options.key : Object.keys(data[0]).find((key: string) => key.includes("id") || key.includes("name")) ?? null;
        // If no valid key is found, return the original data
        if (sortKey === null) {
            if (__DEV__) {
                console.warn("No valid sort key found, returning unsorted data");
            }
            return data;
        }
        // Sort the data based on the specified key
        // and the ascending/descending order
        const sortedData = data.sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return options.ascending ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return options.ascending ? 1 : -1;
            return 0;
        }
        );
        return sortedData;
    }, [])

    const householdTemplates = queryClient.prefetchQuery({
        queryKey: ["householdInventoryTemplates"],
        queryFn: async () => getHouseholdAndInventoryTemplates(),
    })

    const insertTemplatesMutation = useMutation({
        mutationFn: async () => {
            const { household, inventories } = queryClient.getQueryData(["householdInventoryTemplates"]) as { household: object | null, inventories: object[] }
            const user_id = session?.user?.id ?? currentProfile?.user_id ?? null;
            if (user_id !== null) await createHouseholdWithInventories(user_id, household ?? {
                id: null,
                name: "Household",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, inventories ?? [{
                id: null,
                name: "Inventory",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }]);
        },
        onSuccess(data, variables, context) {
            if (__DEV__) {
                console.log("UserHouseholdsProvider insertTemplatesMutation success", JSON.stringify(data, null, 2));
            }
            // refetch the userHouseholds query to get the updated data
            queryClient.invalidateQueries({ queryKey: queryKeys?.userHouseholds });

            // refetch the household query to get the updated data
            queryClient.invalidateQueries({ queryKey: queryKeys?.households });
        },
    })
    //#endregion methods

    //#region queries
    const existingProfile = queryClient.getQueryData(queryKeys?.profiles);

    const profiles = useQuery({
        queryKey: queryKeys.profiles,
        enabled: () => [session, authUser, authenticated].every(Boolean),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", session?.user?.id)
                .single();
            //handle success
            if (!!data && !!!error) {
                //parse profiles
                const parsedProfile = await processUserProfile(data);
                setCurrentProfile(parsedProfile ?? null);
                return parsedProfile;
            }
            //handle error (as default fallback)
            throw new Error(error?.message ?? "Error fetching profiles in UserHouseholdsProvider");
        },
        initialData: existingProfile
    });

    if (profiles.data) {
        if (__DEV__) {
            console.log("UserHouseholdsProvider profiles", JSON.stringify(profiles.data, null, 2));
        }
        //set the current profile
        setCurrentProfile(profiles.data);
    }


    const existingUserHouseholds = queryClient.getQueryData(queryKeys?.userHouseholds);

    const userHouseholds = useQuery({
        queryKey: queryKeys?.userHouseholds,
        enabled: () => [session, authUser, authenticated, authUser?.id].every(Boolean),
        queryFn: async () => {
            if (!!!authUser) return [];
            const { data, error } = await supabase.from("user_households")
                .select("*")
                .eq("user_id", authUser.id)
                .order("household_id", { ascending: true })

            if (!!error) throw new Error(error.message);

            if (data?.length > 0) {
                //sort alphabetically by household_id    
                const userHouseholds = sortResources(data, { key: "id", ascending: true })
                    //parse the data to match the HouseholdTuple type
                    .map((household => [
                        (household as UserHouseholdResponseObject).household_id,
                        (household as UserHouseholdResponseObject)?.access_level ?? "guest",
                        (household as UserHouseholdResponseObject)?.invite_accepted ?? false
                    ] as HouseholdTuple));
                setHouseholdList(userHouseholds);
                return userHouseholds;
            }
            if (data?.length === 0) return [];
        },
        initialData: existingUserHouseholds,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        refetchInterval: 1000 * 60 * 60, // 1 hour
        retry: 1,
    });

    // #endregion
    // update the householdList state when the userHouseholds query returns data
    if (!!userHouseholds?.data) {
        if (__DEV__) {
            console.log("UserHouseholdsProvider userHouseholds", JSON.stringify(userHouseholds.data, null, 2));
        }
        if (!!userHouseholds.data && !Boolean(householdList)) {
            if (Array.isArray(userHouseholds.data)) {
                const parsedHouseholds = userHouseholds.data
                    //sort alphabetically by household_id    
                    .sort((a, b) => {
                        if (a.id < b.id) return -1;
                        if (a.id > b.id) return 1;
                        return 0;
                    })
                    //parse the data to match the HouseholdTuple type
                    .map((household: UserHouseholdResponseObject) => [
                        household.household_id,
                        household?.access_level ?? "guest",
                        household?.invite_accepted ?? false
                    ] as HouseholdTuple);
                setHouseholdList(parsedHouseholds);
            }
        }
    }

    if (!!!userHouseholds?.data && !Boolean(householdList)) {
        if (__DEV__) {
            console.log("UserHouseholdsProvider userHouseholds empty", JSON.stringify(userHouseholds.data, null, 2));
        }
        insertTemplatesMutation.mutate();
    }

    //#region value
    const value = useMemo(() => {
        const sessionResource = {
            householdList,
            setHouseholdList,
            currentProfile,
            setCurrentProfile,
            // userHouseholds: userHouseholds.data ?? [],
            // profiles: profiles.data ?? [],
        }
        if (__DEV__) {
            console.log("UserHouseholdsProvider value", JSON.stringify(sessionResource, null, 2));
        }
        return sessionResource as UserHouseholdsContextType;
    }, [currentProfile, householdList]);
    //#endregion

    return (
        <UserHouseholdsContext.Provider value={value}>
            {children}
        </UserHouseholdsContext.Provider>
    );
}
export const useUserHouseholdsContext = () => {
    const context = useContext(UserHouseholdsContext);
    if (!context) {
        throw new Error('useUserHouseholdsContext must be used within a UserHouseholdsProvider');
    }
    return context;
}

