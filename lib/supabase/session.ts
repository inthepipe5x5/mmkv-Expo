
import defaultUserPreferences from "@/constants/preferences";
import { household, user_households, userProfile } from "@/constants/sessionDefaults";
import supabase from "@/lib/supabase/supabase"
import isTruthy from "@/utils/isTruthy";
import { produce } from "immer";
import { currentEnvVariables } from "@/constants/config";
import { parse } from "@babel/core";

//#region profiles
//fetch user profile from profiles table with an object with a key of the
export const fetchProfile = async ({
    searchKey = "user_id",
    searchKeyValue,
}: {
    searchKey: keyof userProfile;
    searchKeyValue: any;
}) => {
    console.info("Fetching user profile with:", { searchKey, searchKeyValue });
    //guard clause
    if (!searchKeyValue || searchKeyValue === null) throw new TypeError(`Search key value is required to fetch user profile. Received ${{}} AT ${this}`);
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select()
            .eq(String(searchKey), searchKeyValue)
            .limit(1);

        if (!data || data === null || error)
            throw new Error("Error fetching user profile");
        else {
            return data[0] ?? null;
        }
    } catch (error) {
        console.error(error);
        throw error; //propagate error
    }
};


/**@function getUserProfileByEmail Checks if a user with a specific email already exists in the database.
 * @param {string} email - The email address to check for duplication.
 * @returns {Promise<{user: userProfile | null, error: Object}|null>} An object with `user` and `error` properties if a user exists, or null if not.
 */
export const getUserProfileByEmail = async (email: string) => {
    try {
        //do not proceed if email is not provided
        if (!email) return; //throw new Error("Email is required to check for existing user.");
        // Check if the user exists in public.profiles
        const existingProfile = await fetchProfile({
            searchKey: "email",
            searchKeyValue: email,
        });
        console.log("Existing profile:", { existingProfile });

        if (!!existingProfile && existingProfile.length > 0) {
            return { user: existingProfile, error: null } as unknown as { user: userProfile | null, error: Object | null } //return the existing user profile;
        }

        // If no user is found in public.profiles table, return null
        return null;
    } catch (error) {
        console.error("Error finding existing user:", error);
        throw error;
    }
};


/* getProfile - wrapper function that finds the appropriate user profile from supabase */
export type getProfileParams = {
    [K in "name" | "email" | "user_id" | "phone_number"]?: userProfile[K];
};

export const getProfile = async (filterValue: getProfileParams) => {
    //guard clause
    if (!isTruthy(filterValue)) {
        console.warn("No filter value provided to fetch profile.");
        return;
    }
    const [searchKey, searchKeyValue] = Object.entries(filterValue)[0];
    //find the user profile based on the search key and value
    return await fetchProfile({
        searchKey: searchKey as keyof userProfile,
        searchKeyValue,
    });
};
//JSON parse the user profile
export const processUserProfile = async (userInfo: userProfile, options: { skipUpload: boolean } = { skipUpload: false }) => {
    //guard clause
    if (!!!userInfo) {
        if (__DEV__) console.warn("No user info provided to process user profile.");
        return null;
    } //check if the user info is already parsed 
    else if (["name", "first_name", "last_name", "avatar_photo", "app_metadata", "preferences"]
        .every((key, _, array) => array.slice(4).includes(key) ?
            typeof key === "object"
            : typeof key === "string")) {
        console.warn("User info is already parsed.");
        return userInfo;
    }
    //parse the user profile
    else {
        const { name, first_name, last_name, avatar_photo } = userInfo;
        const safeName = !!name ? name : !!first_name && !!last_name ? `${first_name} ${last_name}` : "App User";
        const safeAvatar = currentEnvVariables?.PLACEHOLDER_AVATAR + `/username?username=${safeName.replace(" ", "+")}`;
        const defaultAppMetaData = {
            avatar_url: safeAvatar,
            is_super_admin: false,
            sso_user: false,
            // setup: {
            //     auth: {
            //         email: false,
            //         authenticationMethod: false,
            //         account: false,
            //         details: false,
            //         preferences: false,
            //         confirmation: false,
            //     },
            //     resources: {
            //         joinedHousehold: false,
            //         joinedInventory: false,
            //         addedProduct: false,
            //         addedTask: false,
            //     },
            // },
        };
        let safeAppMetadata = defaultAppMetaData;
        switch (true) {
            case typeof userInfo.app_metadata === "string":
                try {
                    safeAppMetadata = JSON.parse(userInfo.app_metadata);
                } catch (error) {
                    console.error("Error parsing app metadata:", error);
                    safeAppMetadata = defaultAppMetaData;
                }
                break;
            case typeof userInfo.app_metadata === "object":
                // Only merge allowed properties and ensure 'setup' matches the expected type
                const { avatar_url, is_super_admin, sso_user, setup } = userInfo.app_metadata ?? {};
                safeAppMetadata = {
                    ...defaultAppMetaData,
                    ...(typeof avatar_url === "string" ? { avatar_url } : { avatar_url: safeAvatar }),
                    ...(typeof is_super_admin === "boolean" ? { is_super_admin } : { is_super_admin: false }),
                    ...(typeof sso_user === "boolean" ? { sso_user } : { sso_user: false }),
                };
                break;
            default:
                safeAppMetadata = defaultAppMetaData;
        }

        //parse the user profile
        const parsedUserProfile = produce(userInfo, (draft) => {
            draft.name = safeName;
            draft.avatar_photo = avatar_photo ?? safeAvatar;
            draft.preferences = !!userInfo?.preferences
                ? { ...defaultUserPreferences, ...(typeof userInfo.preferences === "string" ? JSON.parse(userInfo.preferences) : userInfo.preferences) }
                : defaultUserPreferences;
            draft.app_metadata = safeAppMetadata as typeof defaultAppMetaData;
        });
        //upload the user profile to supabase if not skipped
        if (!options.skipUpload) {
            const { error } = await supabase
                .from("profiles")
                .upsert(parsedUserProfile, {
                    onConflict: "email",
                    ignoreDuplicates: false, //merge with existing profile
                })
                .eq("user_id", parsedUserProfile.user_id);
            if (error) {
                console.error("Error updating user profile:", error);
                throw error;
            }
        }

        return parsedUserProfile;
    }
}
//#endregion profiles

//#region households

/** ----------------------------------------------------------------------
 *  UserHousehold Methods
 * *
 * 
 * ----------------------------------------------------------------------- 
 * */

/** Fetches user households, households and profiles joined by a user info key
 * 
 * @param userInfo 
 * @returns 
 */
export const fetchUserHouseholdsByUser = async (userInfo: { "user_id": string },
    returnMapped: boolean = false,
    orderBy: "user_households.household_id" |
        "user_households.user_id" |
        "user_households.access_level" = "user_households.household_id"
) => {
    const [user_id, userIDValue] = Object.entries(userInfo)[0];
    const { data, error } = await supabase
        .from("user_households")
        .select("user_households(*), households(*), profiles(name, email, avatar_photo)")
        .eq(`user_households.${String(user_id)}`, userIDValue)
        .eq(`profiles.${String(user_id)}`, userIDValue)
        .eq("households.id", "user_households.household_id")
        .eq("profiles.user_id", "user_households.user_id")
        .eq("households.is_template", false)
        .eq("households.draft_status", "confirmed")
        .filter("access_level", "neq", "guest")
        .order(`${orderBy}`, {
            ascending: true,
            referencedTable: "user_households" //order by the household name
        }) as unknown as {
            data: {
                user_households: user_households[];
                households: household[];
                profiles: Partial<userProfile>[];
            }[],
            error: any
        }

    if (error) {
        console.error("User households table data fetching error:", error);
        throw new Error(error?.message
            ?? "Something went wrong fetching user households joint data.");
    }
    console.log("User households data fetched:", JSON.stringify({ data }, null, 4));

    if (!returnMapped) return data as unknown as {
        user_households: user_households[],
        households: household[],
        profiles: Partial<userProfile>[],
    }

    const mappedHouseholds = new Map(
        (data ?? []).flatMap((item: { user_households: any[] }) =>
            item.user_households.map((userHouseholdRelationRow) => [
                userHouseholdRelationRow.household_id,
                {
                    household: data?.flatMap((item) => item.households).filter((household) => household.id === userHouseholdRelationRow.household_id)[0],
                    relation: userHouseholdRelationRow,
                    householdProfiles: data?.flatMap((item) => item.profiles).filter((profile) => profile.user_id === userHouseholdRelationRow.user_id),
                    ...userHouseholdRelationRow,
                },
            ])
        )
    );
    console.log("Mapped households:", { mappedHouseholds });

    return mappedHouseholds as unknown as {
        user_households: user_households[],
        households: household[],
        profiles: Partial<userProfile>[],
    };

};

export type fetchSpecificUserHouseholdParams = {
    user_id?: string;
    household_id?: string;
};

export const fetchSpecificUserHousehold = async (
    query:
        fetchSpecificUserHouseholdParams
) => {
    console.log("Query params:", query);
    const { user_id, household_id } = query;

    if (!user_id || !household_id) {
        throw new Error("Both user_id and household_id are required");
    }

    const { data, error } = await supabase
        .from("user_households")
        .select("*"
            // `
            // households: household_id (*),
            // user_id: user_id(*),`
        )
        .eq("user_id", user_id)
        .eq("household_id", household_id)
        .single();

    if (error) {
        console.error("User household data fetching error:", error);
        throw new Error(error.message);
    }
    return data as user_households ?? {};
};

export type houseHoldSearchParams = {
    [K in keyof (household | user_households)]?: string;
};
/*
*  ----------------------------
*   fetchUserHouseholdProfiles
*  ----------------------------
*   Fetches user household relations from the user_households table in Supabase.
*
*  */
export const fetchUserHouseholdProfiles = async (householdInfo: { [K in keyof (household | user_households)]: any }) => {
    const [column, value] = Object.entries(householdInfo)[0];

    const { data, error } = await supabase
        .from("user_households")
        .select("user_households(*), households(*), profiles(name, email, avatar_photo)")
        .eq(`${column.toLowerCase() !== 'id' ? `user_households.${column}` : `households.${column}`}`, value) //dynamically match the column name to the value based on the column name (eg. on user or on household)
        .eq('profiles.user_id', "user_households.user_id")
        .eq('households.id', "user_households.household_id")
        .not("access_level", "eq", "guest")
        .eq("households.is_template", false)
        .eq("households.draft_status", "confirmed")
        .order(`"households"."name"`, { ascending: true });

    if (error) {
        console.error("User households table data fetching error:", error);
        throw new Error(error.message);
    }
    console.log("User households data fetched:", { data });
    return data;
};
//#endregion households
//#region tasks

export const fetchUserTasks = async (userInfo: getProfileParams) => {
    const [column, value] = Object.entries(userInfo)[0];
    try {
        const { data, error } = await supabase
            .from("task_assignments")
            .select(
                `task_assignments(*),
          tasks(*),
          profiles(*),
          `
            )
            .eq(`task_assignments.assigned_to`, value)
            .eq(`profiles.${String(column)}`, value)
            .not("tasks.completion_status", "in", ["done", "archived"])
            .not("tasks.draft_status", "in", "published")
            .order("tasks.due_date", { ascending: true });

        if (!data || data === null || error)
            throw new Error("Error fetching user tasks");
        else {
            return data;
        }
    } catch (error) {
        console.error(error);
    }
};

export const fetchOverDueTasks = async (userInfo: getProfileParams) => {
    const [column, value] = Object.entries(userInfo)[0];

    try {
        const { data, error } = await supabase
            .from("task_assignments")
            .select()
            .lte("due_date", new Date().toISOString())
            .eq(`profiles.${String(column)}`, value)
            .not("draft_status", "in", ["published", "draft"])
            .not("completion_status", "in", ["done", "archived"])
            .order("due_date", { ascending: true });

        if (!data || data === null || error)
            throw new Error("Error fetching user overdue tasks");
        else {
            return data;
        }
    } catch (error) {
        console.error(error);
    }
};
// #endregion tasks
//#region inventories

export const fetchUserInventories = async (
    userInfo: getProfileParams,
    household_id_list: string[]
) => {
    const [column, value] = Object.entries(userInfo)[0];

    const { data, error } = await supabase
        .from("inventories")
        .select()
        .eq(`profiles.${String(column)}`, value)
        .in("household_id", household_id_list);

    if (error) {
        console.error("User inventories table data fetching error:", error);
        throw error;
    }
    console.log("User inventories data fetched:", data);
    return data;
};
export const fetchHouseholdInventories = async (
    household_id_list: string[],
    signal?: AbortSignal
) => {

    const { data, error } = await supabase
        .from("inventories")
        .select()
        .in("household_id", household_id_list)
        .order("name", { ascending: true })

    if (error) {
        console.error("User inventories table data fetching error:", error);
        throw error;
    }
    console.log("User inventories data fetched:", data);
    return data;
};
//#endregion inventories