import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabelText, FormControlHelper, FormControlLabel, FormControlHelperText } from "@/components/ui/form-control";
import { Text } from "@/components/ui/text";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/components/contexts/SupabaseProvider";
import { passwordLoginSchema } from "@/lib/schemas/auth.schemas";
import { useStorageContext } from "@/components/contexts/StorageProvider";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { AlertTriangle, EyeIcon, EyeOffIcon } from "lucide-react-native";
// const passwordLoginSchema = z.object({
//     email: z.string().email("Please enter a valid email address."),
//     password: z
//         .string()
//         .min(8, "Please enter at least 8 characters.")
//         .max(64, "Please enter fewer than 64 characters."),
// });

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const { cache } = useStorageContext();
    const { signIn } = useAuth();

    const cachedUser = cache.getItem("user") as null | {
        email?: string;
        preferences?: {
            rememberMe?: boolean;
            [key: string]: any;
        }
        [key: string]: any;
    }

    const form = useForm<z.infer<typeof passwordLoginSchema>>({
        resolver: zodResolver(passwordLoginSchema),
        defaultValues: {
            email: cachedUser?.email ?? "",
            password: "",
            rememberMe: cachedUser?.preferences?.rememberMe ?? false,
        },
        resetOptions: {
            keepDirtyValues: true,
            keepDirty: true,
            keepIsSubmitted: true,
        },
        reValidateMode: "onBlur",
    });

    async function onSubmit(data: z.infer<typeof passwordLoginSchema>) {
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
                <FormControl {...form}>
                    <View className="gap-4">
                        <Controller
                            control={form.control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <>
                                    <FormControlLabel>
                                        <FormControlLabelText>Email</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input>
                                        <InputField
                                            {...field}
                                            placeholder="Email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect={false}
                                            keyboardType="email-address"
                                            returnKeyType="next"
                                            importantForAutofill="yes"
                                        />
                                    </Input>
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertTriangle} />
                                        <FormControlErrorText>
                                            {fieldState.error?.message ?? null}
                                        </FormControlErrorText>
                                    </FormControlError>

                                </>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <>
                                    <FormControlLabel>
                                        <FormControlLabelText>Password</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input>
                                        <InputField
                                            placeholder="Password"
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            autoCorrect={false}
                                            secureTextEntry
                                            autoFocus={true}
                                            type={showPassword ? "text" : "password"}
                                            {...field}
                                        />
                                        <InputSlot
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-4"
                                            accessibilityLabel="Show password"
                                        >
                                            <InputIcon
                                                as={showPassword ? EyeIcon : EyeOffIcon}
                                                size={"md"}
                                                color="text-gray-500"
                                            />
                                        </InputSlot>
                                    </Input>
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertTriangle} />
                                        <FormControlErrorText>
                                            {fieldState.error?.message ?? null}
                                        </FormControlErrorText>
                                    </FormControlError>
                                </>
                            )}
                        />
                    </View>
                </FormControl>
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