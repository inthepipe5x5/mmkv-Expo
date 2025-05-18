import { Stack, useLocalSearchParams } from "expo-router";

export default function PasswordRouteLayout() {
    const params = useLocalSearchParams<{
        headerTitle?: string[];
    }>();
    const headerTitle = params?.headerTitle?.[0] ?? null;
    const headerShown = headerTitle !== null;
    const headerOptions = headerShown ? {
        title: headerTitle,
        headerShown: true,
        headerBackTitleVisible: true,
        headerBackTitle: "Cancel",
    } : {
        headerShown: false,
    }

    return (
        <Stack
            initialRouteName="forgot-password"
            screenOptions={{
                animation: "slide_from_left",
                animationDuration: 500,
                animationTypeForReplace: "push",
                presentation: "transparentModal",
                statusBarAnimation: "slide",
                ...headerOptions
            }}
        >
            <Stack.Screen name="confirm" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="verify-password-reset-code" />
        </Stack>
    )
}