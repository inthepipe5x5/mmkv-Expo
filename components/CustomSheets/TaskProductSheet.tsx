import React, { useImperativeHandle, forwardRef } from "react";
import { TrueSheet, TrueSheetProps } from "@lodev09/react-native-true-sheet";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";
import ProductMasonryList from "../products/ProductMasonryList";
import { Database } from "@/lib/supabase/dbTypes";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";



const TaskProductSheet = forwardRef((props: TrueSheetProps, ref: React.Ref<TrueSheet>) => {
    useImperativeHandle<TrueSheet | null, TrueSheet | null>(ref, () => sheetRef.current);
    const { task_id } = useLocalSearchParams<{ task_id: string }>();
    const sheetRef = React.useRef<TrueSheet>(null);
    const queryAborter = React.useRef<AbortController | null>(null);


    const ErrorContent = (message?: string) => {
        return (
            <ThemedView style={styles.errorContent}>
                <Image
                    source={require("@/assets/images/feedback/page-eaten.png")}
                    contentFit="contain"
                    style={{ width: 200, height: 200, marginTop: 20 }}
                    transition={1000}
                />
                <ThemedText type="title" style={styles.title}>
                    {message ?? "Error loading products"}
                </ThemedText>
            </ThemedView>
        )
    }
    //#region useQuery
    const { data: currentTask, error } = useQuery({
        queryKey: [{ task_id }],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select()
                .eq("id", task_id)
                .limit(10)
                .abortSignal(queryAborter.current?.signal ?? new AbortController().signal);
            if (error) throw error;
            return data[0] as Database["public"]["Tables"]["tasks"]["Row"];
        },
        enabled: !!task_id,
        refetchOnWindowFocus: true,
        refetchOnMount: false,
    })
    //#endregion
    if (error) {
        console.error("Error fetching task products:", error);
        return ErrorContent(error.message);
    }
    // const { data, isLoading, error } = useInfiniteQuery({
    //     queryKey: ["taskProducts", task_id],
    //     queryFn: async () => {
    //         const { data, error } = await supabase
    //         .from("products")
    //         .select()
    //     },
    //     refetchOnWindowFocus: false,
    //     refetchOnMount: false,
    //     refetchInterval: false,
    //     refetchIntervalInBackground: false,
    // });

    // if (isLoading) {

}
    return (
    <TrueSheet
        name="TaskProductSheet"
        sizes={["auto", "100%"]}
        ref={sheetRef}
        onMount={() => {
            console.log("TaskProductSheet mounted!");
        }}
        onDismiss={() => {
            console.log("TaskProductSheet dismissed!");
        }}
        {...props}
    >
        <Image
            source={require("@/assets/images/feedback/page-eaten.png")}
            contentFit="contain"
            style={{ width: 200, height: 200, marginTop: 20 }}
            transition={1000}
        />
    </TrueSheet>
);
});

const styles = StyleSheet.create({
    image: {
        width: "100%",
        maxHeight: 200,
        flexGrow: 1,
        flexShrink: 1,
    },
    title: {
        marginTop: 8,
        fontSize: 18,
    },
    description: {
        marginTop: 8,
        fontSize: 14,
    },
    errorContent: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        flexShrink: 1,
    }

});

TaskProductSheet.displayName = "TaskProductSheet";
export default TaskProductSheet;



