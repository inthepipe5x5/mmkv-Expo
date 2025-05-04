import { useRootContext } from "@/app/_layout";
import { useCameraContext } from "@/components/contexts/CameraContext";
import { Redirect } from "expo-router";
import React from "react";
import { Alert, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Camera, useCameraFormat, useCameraDevice,
    useCameraDevices, useCameraPermission,
    PermissionError, CodeType, DeviceFilter, FormatFilter,
    CameraPermissionRequestResult,
    CameraDevice,
    Templates
} from "react-native-vision-camera"

/**
 * * @description This hook is used to get the camera devices and permission status.
 * * @optional @param {FormatFilter[]} cameraFormatFilter - The format filter to use for the camera devices.
 * * It uses the `useCameraDevices` and `useCameraPermission` hooks from the `react-native-vision-camera` library.
 * * It returns the camera devices and permission status.
 * * @returns {Object} - The camera devices and permission status.
 * * @returns {Object} devices - The camera devices.
 * * @returns {Object} devices.back - The back camera device.
 * * @returns {Object} devices.front - The front camera device.
 */
// export const useVisionCamera = (cameraFormatFilter?: FormatFilter[]) => {
//     const devices = Camera.getAvailableCameraDevices() as CameraDevice[];
//     const permissions = Camera.getCameraPermissionStatus();
//     const device = useCameraDevice('back') as CameraDevice | undefined;
//     const format = useCameraFormat(device?.formats[0] ?? null) as FormatFilter | null;

//     return { devices, device, permission, format };
// }


export default function CameraScreen() {
    const device = useCameraDevice('back') as CameraDevice | undefined;

    const { cache } = useRootContext();
    const { cameraPermission } = useCameraContext();
    cache.setItem("cameraPermission", cameraPermission === true ? "granted" : "denied");

    if (!cameraPermission) {
        return <Redirect href="/camera/grant-permissions" />;
    }

    if (!!!device) {
        return <Redirect href="/camera/no-devices" />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                    horizontal={true} showsHorizontalScrollIndicator={false}>
                </ScrollView>
                <Camera
                    device={device}
                    isActive={true}
                    style={StyleSheet.absoluteFillObject}
                />
            </GestureHandlerRootView>
        </SafeAreaView>
    );
}