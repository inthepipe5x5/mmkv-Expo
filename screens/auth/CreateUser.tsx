import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/components/contexts/SupabaseProvider";
import { simpleCreateUserSchema } from "@/lib/schemas/auth.schemas";
import { AlertTriangle, Eye, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { TermsAndConditionsSheet } from "@/screens/auth/TermsAndConditionsSheet";
import { useStorageContext } from "@/components/contexts/StorageProvider";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { light } from "@/constants/Colors";
import { findDateDifference, isExpired } from "@/utils/date";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";

// This is a simple sign-up form using React Hook Form and Zod for validation.
// It includes fields for email, password, and confirm password.
export const SignUpForm = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const termsConditionsButtonRef = React.useRef<React.ElementRef<typeof Button>>(null);
    const { cache } = useStorageContext()
    const { signUp } = useAuth();

    const cachedUser = cache.getItem("user") as null | {
        email?: string;
        preferences?: {
            rememberMe?: boolean;
            [key: string]: any;
        }
        [key: string]: any;
    }

    //effect to set "accepted" to true if userAgreement is set in cache
    React.useEffect(() => {
        let mounted = true // flag to prevent setting state on unmounted component
        const acceptedListener = cache.storage.addOnValueChangedListener((key: string) => {
            if (key === "userAgreement" && mounted) {
                const value = cache.getItem(key)
                if (value !== null && !isExpired(new Date(value).toDateString(), 1000 * 60 * 60)) {
                    form.setValue("accepted", true)
                } else {
                    form.setValue("accepted", false)
                }
            }
        })
        return () => {
            mounted = false // set flag to false on unmount
            // cleanup listener to prevent memory leaks
            acceptedListener.remove()
        }
    }, [])


    const form = useForm<z.infer<typeof simpleCreateUserSchema>>({
        resolver: zodResolver(simpleCreateUserSchema) as any, //lint ignore
        defaultValues: {
            email: cachedUser?.email ?? "",
            password: "",
            confirmPassword: "",
            rememberMe: cachedUser?.preferences?.rememberMe ?? false,
            accepted: !!cache.getItem("userAgreement") ? true : false,
        },
        resetOptions: {
            keepDirtyValues: true,
            keepDirty: true,
            keepIsSubmitted: true,
        },
        reValidateMode: "onBlur",
    });

    const showTermsAndConditions = async () => {
        await TrueSheet.present('TermsAndConditionsSheet')
    }

    const onSubmit: SubmitHandler<z.infer<typeof simpleCreateUserSchema>> = async (data: {
        email: string;
        password: string;
        confirmPassword: string;
        rememberMe: boolean;
        accepted: boolean;
    },

    ) => {
        try {
            setIsLoading(true);
            //check if userAgreement is set in cache and if it is less than 1 hour old
            const agreement = cache.getItem("userAgreement") as string | null;
            if (!!agreement && findDateDifference(new Date(), new Date(agreement), "hours") < 1) {
                await signUp(data.email, data.password);
            }
            await showTermsAndConditions();
            form.reset();
        } catch (error: Error | any) {
            console.error(error.message);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <View className="flex-1 gap-4 web:m-4 p-5 pt-5">
                <ThemedText type="title"
                    className="self-start mt-4  dark:text-white text-black font-bold text-2xl">
                    Sign Up
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
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            onBlur={field.onBlur}
                                            placeholder="Password"
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            autoCorrect={false}
                                            secureTextEntry={!showPassword}
                                        // type={showPassword ? "text" : "password"}
                                        />
                                        <InputSlot
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                                            accessibilityLabel="Show password"
                                        >
                                            <InputIcon
                                                as={showPassword ? EyeIcon : EyeOffIcon}
                                                size={"md"}
                                                color="black"
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
                        <Controller
                            control={form.control}
                            name="confirmPassword"
                            render={({ field, fieldState }) => (
                                <>
                                    <FormControlLabel>
                                        <FormControlLabelText>Confirm Password</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input>
                                        <InputField
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            onBlur={field.onBlur}
                                            placeholder="Confirm password"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            secureTextEntry={!showPassword}
                                        // type={showPassword ? "text" : "password"}
                                        />
                                        <InputSlot
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"

                                            accessibilityLabel="Show password"
                                        >
                                            <InputIcon
                                                as={showPassword ? EyeIcon : EyeOffIcon}
                                                size={"md"}
                                                color="black"
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
            </View >
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
                    android_ripple={{ color: light.primary }}
                    action={cache.getItem("userAgreement") === null ? "primary" : "positive"}
                    onPress={async () => {
                        switch (true) {
                            case cache.getItem("userAgreement") === null:
                                await showTermsAndConditions();
                                return;
                            //proceed with form submission if more than 1 hour has passed since last acceptance of terms and conditions
                            case isExpired(
                                new Date(cache.getItem("userAgreement") as string).toDateString(), 1000 * 60 * 60):
                                await form.handleSubmit(onSubmit)();
                            // remove userAgreement from cache if more than 1 hour has passed since last acceptance of terms and conditions
                            default:
                                cache.removeItem("userAgreement");
                                await showTermsAndConditions();
                        }
                    }}
                    disabled={isLoading || !!!form.formState.errors}
                    className="web:m-4 text-white group-hover/button:text-white group-active/button:text-white">
                    {form.formState.isSubmitting ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <ButtonText>Sign Up</ButtonText>
                    )}
                </Button>
            </VStack>
        </>
    );
}

export default function CreateUserScreen() {
    return (
        <SafeAreaView
            className="flex-1 bg-background-100 dark:bg-background-900 p-4"
            edges={["bottom", "top"]}>
            <SignUpForm />
            <TermsAndConditionsSheet />
        </SafeAreaView>
    );
}