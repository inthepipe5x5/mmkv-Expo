import { useContext, useState, useCallback, useMemo, createContext, useEffect, ReactNode } from "react";
import { useSessionResourceContext } from "./UserHouseholdsContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";
import { Database } from "@/lib/supabase/dbTypes";
import { Toast, ToastDescription, ToastTitle, useToast } from "../ui/toast";
import { fetchHouseholdInventories } from "@/lib/supabase/session";
import { useMMKVObject, useMMKVString } from "react-native-mmkv";
import { useStorageContext } from "./StorageProvider";
import { access_level } from "@/constants/sessionDefaults";

type Household = Database["public"]["Tables"]["households"]["Row"];

interface CurrentHouseholdContextProps {
    currentHousehold: Household | null;
    setCurrentHousehold: (args: any) => void;
    switchHousehold: (householdId: string) => void;
    accessLevel: string | null;
    setAccessLevel: (args: any) => void;
    currentHouseholdId: string | null;
    setCurrentHouseholdId: (args: any) => void;
    isLoading: boolean;
    error: any;
}

const CurrentHouseholdContext = createContext<CurrentHouseholdContextProps | undefined>(undefined);

export function CurrentHouseholdProvider({ children }: { children: ReactNode }) {
    const { cache } = useStorageContext();
    const { householdList } = useSessionResourceContext();
    const queryClient = useQueryClient();
    const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
    const [currentHousehold, setCurrentHousehold] = useMMKVObject<Household | null>("currentHousehold", cache.storage);
    const [currentHouseholdAccessLevel, setCurrentHouseholdAccessLevel] = useMMKVString("accessLevel", cache.storage);

    const toast = useToast();

    // On mount or session change, initialize to first available household
    useEffect(() => {
        if (!!householdList) {
            const firstHousehold = householdList[0];
            if (firstHousehold) {
                setCurrentHouseholdId(firstHousehold[0]);
                setCurrentHouseholdAccessLevel(firstHousehold[1]);
            }
        }
    }, [householdList]);

    const { data: currentHouseholdData, isLoading, error } = useQuery<Household | null>({
        queryKey: ["household", currentHouseholdId],
        queryFn: async () => {
            if (!currentHouseholdId) return null;
            const { data, error } = await supabase
                .from("households")
                .select("*")
                .eq("id", currentHouseholdId)
                .single();
            if (error) throw error;
            return data as Household;
        },
        enabled: !!currentHouseholdId, // Only run query if we have a householdId
    });

    if (currentHouseholdData) {
        setCurrentHousehold(currentHouseholdData);
    }

    const switchHousehold = useCallback((newHouseholdId: string) => {
        if (newHouseholdId === currentHouseholdId) return;

        setCurrentHouseholdId(newHouseholdId);

        queryClient.invalidateQueries({ queryKey: ["household", newHouseholdId] });

        queryClient.prefetchQuery({
            queryKey: ["inventories", newHouseholdId],
            queryFn: async () => fetchHouseholdInventories([newHouseholdId]),
        });

        queryClient.prefetchInfiniteQuery({
            queryKey: ["products", newHouseholdId],
            queryFn: async () => {
                const { data, error } = await supabase
                    .from("products")
                    .select("*, inventories(household_id)")
                    .eq("products.inventory_id", "inventories.id")
                    .eq("inventories.household_id", newHouseholdId)
                    .eq("inventories.is_active", true)
                    .limit(20)
                    .order("created_at", { ascending: false });
                if (error) throw error;
                return data;
            },
            initialPageParam: undefined,
        });

        queryClient.prefetchInfiniteQuery({
            queryKey: ["household_tasks_orderedby_due_date", newHouseholdId],
            queryFn: async () => {
                const { data, error } = await supabase
                    .from("tasks")
                    .select("*, products(id), task_assignments(user_id)")
                    .eq("products.inventory_id", "inventories.id")
                    .eq("inventories.household_id", newHouseholdId)
                    .match({
                        "task.draft_status": "confirmed",
                        // "task_assignments.user_id": currentProfile.user_id,
                    })
                    .neq("task.completion_status", "completed")
                    .limit(20)
                    .order("task.due_date", { ascending: false });
                if (error) throw error;
                return data;
            },
            initialPageParam: undefined,
        });

        toast.show({
            placement: "bottom right",
            render: ({ id }) => (
                <Toast nativeID={id} variant="solid" action="info">
                    <ToastTitle>Household Switched</ToastTitle>
                    <ToastDescription>Loading inventories and tasks...</ToastDescription>
                </Toast>
            ),
        });
    }, [currentHouseholdId]);

    const value = useMemo(() => {
        const value = {
            currentHouseholdId: currentHouseholdId ?? null,
            setCurrentHouseholdId,
            currentHousehold: currentHousehold ?? null,
            setCurrentHousehold,
            switchHousehold,
            accessLevel: currentHouseholdAccessLevel ?? null,
            setAccessLevel: setCurrentHouseholdAccessLevel,
            isLoading,
            error,
        }
        if (__DEV__) console.log("CurrentHouseholdContext value:", value);
        return value;
    }, [
        currentHouseholdId,
        currentHousehold,
        currentHouseholdAccessLevel
    ]);

    return (
        <CurrentHouseholdContext.Provider
            value={value}
        >
            {children}
        </CurrentHouseholdContext.Provider>
    );
}

export function useCurrentHousehold() {
    const context = useContext(CurrentHouseholdContext);
    if (!context) {
        throw new Error("useCurrentHousehold must be used inside a CurrentHouseholdProvider");
    }
    return context;
}
// #endregion provider