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
import { light } from "@/constants/Colors";
import * as SplashScreen from "expo-splash-screen";
import { ThemedView } from "@/components/ThemedView";
import { VStack } from "@/components/ui/vstack";
import { HelloWave } from "@/components/HelloWave";
import { useRouter } from "expo-router";
// const passwordLoginSchema = z.object({
//     email: z.string().email("Please enter a valid email address."),
//     password: z
//         .string()
//         .min(8, "Please enter at least 8 characters.")
//         .max(64, "Please enter fewer than 64 characters."),
// });

export const SignInForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const { cache } = useStorageContext();
    const { signIn } = useAuth();
    const router = useRouter();

    const cachedUser = cache.getItem("user") as null | {
        email?: string;
        preferences?: {
            rememberMe?: boolean;
            [key: string]: any;
        }
        [key: string]: any;
    }

    const form = useForm<z.infer<typeof passwordLoginSchema>>({
        resolver: zodResolver(passwordLoginSchema) as any,
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
        // <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom", "top"]}>
        <>
            <View className="flex-1 gap-4 web:m-4 p-5 pt-5">
                <ThemedText
                    type="title"
                    className="self-start mt-4 dark:text-white text-black font-bold text-2xl">
                    <HelloWave />
                    Sign In
                </ThemedText>
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
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            onBlur={field.onBlur}
                                            placeholder="Email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect={false}
                                            keyboardType="email-address"
                                            returnKeyType="next"
                                            importantForAutofill="yes"
                                            autoFocus={true}
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
                                            secureTextEntry={!showPassword}
                                            autoFocus={true}
                                            // type={showPassword ? "text" : "password"}
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            onBlur={field.onBlur}
                                        />
                                        <InputSlot
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                                            accessibilityLabel="Show password"
                                        >
                                            <InputIcon
                                                as={showPassword ? EyeIcon : EyeOffIcon}
                                                size={"md"}
                                                color={showPassword ? light.accent : "black"}
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
            {/* <View className="flex-col items-center justify-between web:m-4 p-5 pt-5"
            > */}
            <VStack space={"lg"} className="flex-1 justify-end">
                <Button
                    size="md"
                    action={"secondary"}
                    android_ripple={{ color: light.primary }}
                    onPress={() => router.push("/auth/CreateAccount")}
                    disabled={form.formState.isSubmitting}
                    className="web:m-4 text-white group-hover/button:text-white group-active/button:text-white">
                    <ButtonText>
                        New user?
                    </ButtonText>
                </Button>
                <Button
                    size="md"
                    action={form.formState.isValid ? "positive" : "primary"}
                    android_ripple={{ color: light.primary }}
                    onPress={form.handleSubmit(onSubmit)}
                    disabled={form.formState.isSubmitting}
                    className="web:m-4 text-white group-hover/button:text-white group-active/button:text-white">

                    {form.formState.isSubmitting ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <ButtonText
                            className="text-center text-white font-semibold"
                        >Sign In</ButtonText>
                    )}
                </Button>
            </VStack>
            {/* </View> */}
        </>
    )
    // </SafeAreaView >

}

export default function SignIn() {
    console.log("SignIn screen mounted");

    return (
        <SafeAreaView className="flex-1 bg-background-100 p-4" edges={["bottom", "top"]}>
            <SignInForm />
        </SafeAreaView>
    )
}