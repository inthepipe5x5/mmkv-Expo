import React, { createContext, useContext, useState } from "react";
import { Stack } from "expo-router";
import { useAuth } from "@/components/contexts/SupabaseProvider";
import { AuthFlowProvider, useAuthFlow } from "@/components/contexts/AuthFlowContext";
import { passwordLoginSchema } from "@/lib/schemas/auth.schemas";

export default function UserSignInLayout() {
    const { session, signIn } = useAuth()

    return (
        <AuthFlowProvider
            schema={passwordLoginSchema}
            mutationFn={async ({ email, password }) => await signIn(email, password)}
        >
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Protected
                    guard={!!!session} //falsy session means not logged in -> route is protected
                >
                    <Stack.Screen name="confirm" />
                    <Stack.Screen name="index" />
                </Stack.Protected>
            </Stack>
        </AuthFlowProvider>
    )
}
