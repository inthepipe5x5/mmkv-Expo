import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "nativewind"
import * as appInfo from "@/app.json";
import { ImageBackground } from "expo-image";
import { Asset } from "expo-asset";
export default function WelcomeScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    // const welcomeCard =
    //     colorScheme !== "dark"
    //         ? Asset.fromModule(require("../../assets/images/LightMode_welcomeCard.png"))
    //         : Asset.fromModule(require("../../assets/images/DarkMode_welcomeCard.png"));

    return (
        <SafeAreaView className="flex flex-1 bg-background p-4">
            <View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
                <Image source={require('@/assets/images/auth/auth-required.png')} className="flex flex-1 w-full h-full"
                />
                <ThemedText type="title" className="text-center">Welcome to {appInfo.expo.name}</ThemedText>
                <Text>

                    {" "}
                </Text>
                <ThemedText className="text-center">
                    Manage your home inventory effortlessly. Keep track of your belongings, organize them by categories, and never lose sight of what you own.
                </ThemedText>
            </View>
            <View className="flex flex-col gap-y-4 web:m-4">
                <Button
                    size="md"
                    action="primary"
                    onPress={() => {
                        router.push("/auth/CreateAccount");
                    }}
                >
                    <ButtonText
                        className="text-center text-white font-semibold"
                        style={{ fontSize: 16, lineHeight: 24 }}
                    >New User</ButtonText>
                </Button>
                <Button
                    size="md"
                    action="secondary"
                    onPress={() => {
                        router.push("/auth/SignIn");
                    }}
                >
                    <ButtonText>Sign In</ButtonText>
                </Button>
            </View>
            {/* </Image> */}
        </SafeAreaView>
    );
}