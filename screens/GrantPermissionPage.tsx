import React, { useEffect } from "react";
import { useRouter, useLocalSearchParams, RelativePathString, Redirect } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Camera, CameraPermissionStatus, useCameraPermission } from "react-native-vision-camera";
import { useStorageContext }  from "@/components/contexts/StorageProvider";
import { useIsFocused } from "@react-navigation/native";

export default function GrantPermissionPage() {

    const isFocused = useIsFocused();
    const router = useRouter();
    const { hasPermission, requestPermission } = useCameraPermission();
    const viewVisible = router.canGoBack();
    const { cache } = useStorageContext();
    const [cameraPermission, setCameraPermission] = React.useState<boolean | null>(null);
    const { title, message, dismissPath } = useLocalSearchParams<{
        title?: string[];
        message?: string[];
        dismissPath?: RelativePathString[];
    }>();

    const descriptionText = (message ?? ["We require Camera locations to be granted in order to scan barcodes and share media as part of the core app experience."]).reduce((acc, curr) => {
        const endsWithPeriod = curr.endsWith(".");
        return acc + " " + curr.trim() + (endsWithPeriod ? "" : ".");
    }, "").trim();

    const handleDismiss = React.useCallback(() => {
        if (!!dismissPath) {
            router.push(dismissPath[0] ?? "/" as RelativePathString);
        } else if (viewVisible) {
            router.back();
        } else {
            router.replace("/");
        }
    }, []);


    const updatePermissionStatus = React.useCallback((permission: CameraPermissionStatus) => {
        const cachedPermission = cache.getItem("cameraPermission") as CameraPermissionStatus | null;
        console.log("Cached permission", cachedPermission);

        // //do nothing when the permission is same as the cached permission
        if (cachedPermission === permission) return;

        cache.setItem("cameraPermission", permission);
        switch (permission) {
            case "denied":
                setCameraPermission(false);
                break;
            case "granted":
                setCameraPermission(true);
                break;
            default:
                setCameraPermission(null);
        }
        console.log("Camera permission updated and cached.", JSON.stringify({ hasPermission, permission }, null, 2));
    }, [])

    useEffect(() => {
        if (cameraPermission !== hasPermission) {
            setCameraPermission(hasPermission);
        }
        updatePermissionStatus(Camera.getCameraPermissionStatus() as CameraPermissionStatus);
        console.log("Camera permission synced with cache", { hasPermission });
    }, [isFocused]);

    if (cameraPermission) {
        return <Redirect href="/camera/photo" />;
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.title}>{title?.[0] ?? "Grant Camera Permission"}</Text>
            <Text style={styles.description}>{descriptionText ?? "No permissions set"}</Text>
            (
            <TouchableOpacity
                style={[styles.actionButton, { padding: 10, backgroundColor: "blue", borderRadius: 5, marginTop: 10 }]}
                activeOpacity={0.7}
                onPress={() => Linking.openSettings()}
            >
                <Text style={{ color: "white" }}> Open Settings</Text>
            </TouchableOpacity>
            )
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
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#007AFF",
        borderRadius: 8,
    },
});