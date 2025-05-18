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
// import { TermsAndConditionsSheet } from "@/screens/auth/ConfirmSignup";
import { useStorageContext } from "@/components/contexts/StorageProvider";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { light } from "@/constants/Colors";
import { findDateDifference, isExpired } from "@/utils/date";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useAuthFlow } from "@/components/contexts/AuthFlowContext";

// This is a simple sign-up form using React Hook Form and Zod for validation.
// It includes fields for email, password, and confirm password.
export const SignUpForm = () => {

    const [showPassword, setShowPassword] = useState(false);
    const { form, onSubmit, mutationState } = useAuthFlow();

    // //effect to set "accepted" to true if userAgreement is set in cache
    // React.useEffect(() => {
    //     let mounted = true // flag to prevent setting state on unmounted component
    //     const acceptedListener = cache.storage.addOnValueChangedListener((key: string) => {
    //         if (key === "userAgreement" && mounted) {
    //             const value = cache.getItem(key)
    //             if (value !== null && !isExpired(new Date(value).toDateString(), 1000 * 60 * 60)) {
    //                 form.setValue("accepted", true)
    //             } else {
    //                 form.setValue("accepted", false)
    //             }
    //         }
    //     })
    //     return () => {
    //         mounted = false // set flag to false on unmount
    //         // cleanup listener to prevent memory leaks
    //         acceptedListener.remove()
    //     }
    // }, [])


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
                    onPress={() => router.push("/auth/(signup)")}
                    disabled={form.formState.isSubmitting}
                    className="web:m-4 text-white group-hover/button:text-white group-active/button:text-white">
                    <ButtonText>
                        New user?
                    </ButtonText>
                </Button>

                <Button
                    size="md"
                    android_ripple={{ color: light.primary }}
                    action={"positive"}
                    // action={cache.getItem("userAgreement") === null ? "primary" : "positive"}
                    onPress={() => router.push("/auth/signup/confirm")}
                    disabled={mutationState.isPending || !!!form.formState.errors}
                    className="web:m-4 text-white group-hover/button:text-white group-active/button:text-white">
                    {form.formState.isSubmitting ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <ButtonText>Review Terms and Conditions</ButtonText>
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
            {/* <TermsAndConditionsSheet /> */}
        </SafeAreaView>
    );
}