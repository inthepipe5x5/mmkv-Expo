import { Stack } from "expo-router";
import { Appearance } from "react-native";
import { light, dark } from "@/constants/Colors"

export const unstable_settings = {
    initialRouteName: "index",
};

export default function AuthLayout() {
    const currentTheme = Appearance.getColorScheme() ?? "light";
    const { background } = currentTheme === "light" ? light : dark;

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: background },
                animation: "fade_from_bottom",
                animationDuration: 300,
            }}
        >
            <Stack.Screen name="index" options={{ title: "Welcome" }} />
            <Stack.Screen name="SignIn" options={{ title: "Sign In" }} />
            <Stack.Screen name="SignUp" options={{ title: "Sign Up" }} />
            {/* <Stack.Screen name="ForgotPassword" options={{ title: "Forgot Password" }} /> */}
            {/* <Stack.Screen name="ResetPassword" options={{ title: "Reset Password" }} /> */}
        </Stack>
    );
}