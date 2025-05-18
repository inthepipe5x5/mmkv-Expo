import React from "react";
import { useRouter, Stack, RelativePathString } from "expo-router";
import { useRouteTitle } from "@/hooks/useRouteTitle";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { ArrowLeftIcon } from "@/components/ui/icon";
import { authFormType, useAuth } from "@/components/contexts/SupabaseProvider";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import supabase from "@/lib/supabase/supabase";
import { set } from "react-hook-form";


export default function VerifyPasswordReset() {
    const router = useRouter();
    const { title } = useRouteTitle("Reset Password Code");
    const toast = useToast();
    const { authForm, setAuthForm, requestPasswordReset } = useAuth();
    return (
        <>
            <Modal
                isOpen={router.canDismiss()}
                onClose={() => {
                    router.dismiss();
                }}
                className="w-full max-w-sm"
                avoidKeyboard={true}
                closeOnOverlayClick={false}
                isKeyboardDismissable={false}
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader className="flex-col items-start gap-0.5">
                        <Heading>{title}</Heading>
                        <Text size="sm">
                            A verification code has been sent to you. Enter code below.
                        </Text>
                    </ModalHeader>
                    <ModalBody className="mb-4">
                        <Input>
                            <InputField
                                value={authForm?.verificationCode}
                                onChangeText={(text) => {
                                    setAuthForm((formDraft: authFormType) => {
                                        formDraft.verificationCode = text;
                                    });
                                }}
                                autoCapitalize="none"
                                placeholder="Enter verification code"
                            />
                        </Input>
                    </ModalBody>
                    <ModalFooter className="flex-col items-start">
                        <Button
                            onPress={async () => {
                                if ([
                                    !!!authForm?.verificationCode,
                                    !!!authForm.email
                                ]
                                    .every(Boolean)
                                ) {
                                    toast.show({
                                        duration: 3000,
                                        placement: "top",
                                        render: ({ id }) => (
                                            <Toast
                                                nativeID={id}
                                                variant="solid"
                                                action="error"
                                                className="max-w-28 flex-wrap gap-2 items-center m-5 p-2"
                                            >
                                                <ToastTitle>Error: Invalid code</ToastTitle>
                                                <ToastDescription>Please enter a valid code.</ToastDescription>
                                            </Toast>
                                        )
                                    })
                                    return;
                                }
                                const { error } = await supabase.auth.verifyOtp({
                                    email: authForm?.email as string,
                                    token: authForm?.verificationCode as string,
                                    type: "recovery"
                                })

                                if (error) {
                                    //clear the verification code
                                    setAuthForm((formDraft: authFormType) => {
                                        formDraft.verificationCode = "";
                                    });
                                    //show error toast
                                    toast.show({
                                        duration: 3000,
                                        placement: "top",
                                        render: ({ id }) => (
                                            <Toast
                                                nativeID={id}
                                                variant="solid"
                                                action="error"
                                                className="max-w-28 flex-wrap gap-2 items-center m-5 p-2"
                                            >
                                                <ToastTitle>Error: Invalid code</ToastTitle>
                                                <ToastDescription>{error.message}</ToastDescription>
                                            </Toast>
                                        )
                                    })
                                    return;
                                }
                                //if no error, navigate to reset password screen
                                router.push("/auth/(password)/reset")

                            }
                            }
                            className="w-full"
                        >
                            <ButtonText>Continue</ButtonText>
                        </Button>
                        <Text size="sm" className="">
                            {` Didn't receive the email?`}
                            <Button className=""
                                variant="link"
                                size="xs"
                                onPress={
                                    async () => {
                                        console.log("Resend code");
                                        const email = authForm?.email ?? null;
                                        if (email === null) {
                                            toast.show({
                                                duration: 3000,
                                                placement: "top",
                                                render: ({ id }) => (
                                                    <Toast
                                                        nativeID={id}
                                                        variant="solid"
                                                        action="error"
                                                        className="max-w-28 flex-wrap gap-2 items-center m-5 p-2"
                                                    >
                                                        <ToastTitle>Error: Invalid email</ToastTitle>
                                                        <ToastDescription>Please re-enter the email to resend the code.</ToastDescription>
                                                    </Toast>
                                                )
                                            })
                                            setAuthForm((formDraft: authFormType) => {
                                                formDraft.email = "";
                                            });
                                            router.push("/auth/(password)/forgot-password" as RelativePathString)
                                            return;
                                        }
                                        await requestPasswordReset(email as string);
                                    }
                                }
                            >
                                <ButtonText
                                    size="xs"
                                    className="text-typography-700 font-semibold"
                                >
                                    Click to resend
                                </ButtonText>
                            </Button>
                        </Text>
                        <HStack space="xs" className="items-center">
                            <Button
                                variant="link"
                                size="sm"
                                onPress={() => {
                                    router.push("/auth/(signin)" as RelativePathString)
                                }}
                                className="gap-1"
                            >
                                <ButtonIcon as={ArrowLeftIcon} />
                                <ButtonText>Back to login</ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </>
    );
}


