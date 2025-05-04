import React from "react";
import { Stack } from "expo-router";
import { CameraProvider } from "@/components/contexts/CameraContext";
import Camera from "./photo";
import { Platform } from "react-native";

export const unstable_settings = {
    initialRouteName: "index",
}

export default function CameraLayout() {
    return (
        <CameraProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                    contentStyle: { backgroundColor: "transparent" },
                    presentation: ['ios', 'android'].includes(Platform.OS) ? "formSheet" : "fullScreenModal"
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="photo" />
                <Stack.Screen name="codeScanner" />
                <Stack.Screen name="grant-permissions" />
                <Stack.Screen name="no-devices" />
            </Stack>
        </CameraProvider>
    )
}