import React from "react";
import { useCameraContext } from "@/components/contexts/CameraContext";
import { Redirect } from "expo-router";
import { useCameraDevices } from "react-native-vision-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";

export default function LoadingCameraScreen() {
    const { cameraPermission } = useCameraContext();
    const devices = useCameraDevices();

    console.log("LoadingCameraScreen", { cameraPermission, devices });

    switch (true) {
        case cameraPermission === true:
            return <Redirect href="/camera/photo" />;
        case cameraPermission === false:
            return <Redirect href="/camera/grant-permissions" />;
        case cameraPermission === null:
            return <Redirect href="/camera/grant-permissions" />;
        case devices.length === 0:
            return <Redirect href="/camera/no-devices" />;
        default:
            return (
                <SafeAreaView style={{ flex: 1 }}>
                    <Text style={{ fontSize: 32, fontWeight: "bold" }}>Loading...</Text>
                </SafeAreaView>
            );
    }
}