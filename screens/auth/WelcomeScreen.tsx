import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "nativewind"
import * as appInfo from "@/app.json";

export default function WelcomeScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const welcomeCard =
        colorScheme === "dark"
            ? require("@/assets/images/LightMode_welcomeCard.png")
            : require("@/assets/images/DarkMode_welcomeCard-dark.png");

    return (
        <SafeAreaView className="flex flex-1 bg-background p-4">
            <View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
                <Image source={welcomeCard} className="w-16 h-16 rounded-xl" />
                <ThemedText className="text-center">Welcome to {appInfo.expo.name}</ThemedText>
                <ThemedText className="text-center">
                Manage your home inventory effortlessly. Keep track of your belongings, organize them by categories, and never lose sight of what you own.
                </ThemedText>
            </View>
            <View className="flex flex-col gap-y-4 web:m-4">
                <Button
                    size="md"
                    action="primary"
                    onPress={() => {
                        router.push("/sign-up");
                    }}
                >
                    <Text>Sign Up</Text>
                </Button>
                <Button
                    size="md"
                    action="secondary"
                    onPress={() => {
                        router.push("/sign-in");
                    }}
                >
                    <Text>Sign In</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}