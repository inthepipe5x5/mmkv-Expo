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

// This is a simple sign-up form using React Hook Form and Zod for validation.
// It includes fields for email, password, and confirm password.
export default function SignUp() {

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const termsConditionsButtonRef = React.useRef<React.ElementRef<typeof Button>>(null);
    const { cache } = useStorageContext()
    const { signUp } = useAuth();


    //effect to set "accepted" to true if userAgreement is set in cache
    React.useEffect(() => {
        const acceptedListener = cache.storage.addOnValueChangedListener((key: string) => {
            if (key === "userAgreement") {
                const value = cache.getItem(key)
                if (value !== null) {
                    form.setValue("accepted", true)
                } else {
                    form.setValue("accepted", false)
                }
            }
        })
        return () => {
            acceptedListener.remove()
        }
    }, [])


    const form = useForm<z.infer<typeof simpleCreateUserSchema>>({
        resolver: zodResolver(simpleCreateUserSchema), //lint ignore
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            rememberMe: false,
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
            if (cache.getItem("userAgreement") === null) {
                await showTermsAndConditions()
                return
            }
            await signUp(data.email, data.password);

            form.reset();
        } catch (error: Error | any) {
            console.error(error.message);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
            <View className="flex-1 gap-4 web:m-4">
                <ThemedText type="title" className="self-start">Sign Up</ThemedText>
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
                                            placeholder="Confirm password"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            secureTextEntry
                                            {...field}
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
                        {/* <Controller
                            control={form.control}
                            name="accepted"
                            render={({ field, fieldState }) => (
                                <>
                                    <FormControlLabel>
                                        <FormControlLabelText>Accept Terms and Conditions</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        className="flex-row items-center gap-2">
                                        <InputField
                                            placeholder="Accept terms and conditions"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            {...field}
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
                        /> */}
                        <Button
                            size="lg"
                            action="primary"
                            android_ripple={{ color: light.primary }}
                            onPress={async () => showTermsAndConditions()}
                            ref={termsConditionsButtonRef}
                        >
                            <ButtonIcon as={Eye} size="md" color="text-gray-500" />
                            <ButtonText className="text-gray-500">Open Terms and Conditions</ButtonText>
                        </Button>
                    </View>
                </FormControl>
            </View >
            <Button
                size="md"
                action="positive"
                onPress={form.handleSubmit(onSubmit(form.getValues()))}
                disabled={form.formState.isSubmitting || isLoading || cache.getItem("userAgreement") === null}
                className="web:m-4 text-white group-hover/button:text-white group-active/button:text-white">

                {form.formState.isSubmitting ? (
                    <ActivityIndicator size="small" />
                ) : (
                    <Text>Sign Up</Text>
                )}
            </Button>
        </SafeAreaView >
    );
}