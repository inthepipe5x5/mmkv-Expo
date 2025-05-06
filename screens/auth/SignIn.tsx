import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/components/contexts/SupabaseProvider";

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z
        .string()
        .min(8, "Please enter at least 8 characters.")
        .max(64, "Please enter fewer than 64 characters."),
});

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await signIn(data.email, data.password);

            form.reset();
        } catch (error: Error | any) {
            console.error(error.message);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
            <View className="flex-1 gap-4 web:m-4">
                <ThemedText className="self-start ">Sign In</ThemedText>
                <Form {...form}>
                    <View className="gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormInput
                                    label="Email"
                                    placeholder="Email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    {...field}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormInput
                                    label="Password"
                                    placeholder="Password"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    secureTextEntry
                                    {...field}
                                />
                            )}
                        />
                    </View>
                </Form>
            </View>
            <Button
                size="md"
                action="positive"
                onPress={form.handleSubmit(onSubmit)}
                disabled={form.formState.isSubmitting}
                className="web:m-4 text-white group-hover/button:text-white group-active/button:text-white">

                {form.formState.isSubmitting ? (
                    <ActivityIndicator size="small" />
                ) : (
                    <Text>Sign In</Text>
                )}
            </Button>
        </SafeAreaView>
    );
}