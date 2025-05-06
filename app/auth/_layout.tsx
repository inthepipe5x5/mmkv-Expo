import { Stack } from "expo-router";

export const unstable_settings = {
    initialRouteName: "index",
};

export function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "white" },
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