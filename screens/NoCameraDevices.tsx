import React from "react";
import { useRouter, useLocalSearchParams, RelativePathString } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function NoCameraDevices() {
    const router = useRouter();
    const viewVisible = router.canGoBack();

    const { title, message, dismissPath } = useLocalSearchParams<{
        title?: string[];
        message?: string[];
        dismissPath?: RelativePathString[];
    }>()
    const descriptionText = (message ?? ["This device does not have any camera devices."]).reduce((acc, curr) => {
        const endsWithPeriod = curr.endsWith(".")
        return acc + " " + curr.trim() + (endsWithPeriod ? "" : ".");
    }
        , "").trim();

    const handleDismiss = () => {
        if (!!dismissPath) {
            router.push(dismissPath[0] ?? "/" as RelativePathString);
        }

        else if (viewVisible) {
            router.back();
        }
        else {
            router.replace("/");
        }
    }


    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.title}>{title?.[0] ?? "No Camera Devices Found"}</Text>
            <Text style={styles.description}>{descriptionText ?? "No Camera Devices Found"}</Text>
            <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.7}
                onPress={handleDismiss}>
                <Text>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 24,
        textAlign: "center",
    },
    actionButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    actionButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
});