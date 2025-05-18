import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { ArrowLeftIcon } from "@/components/ui/icon";
import React from "react";
import { useRouter, useSegments, useLocalSearchParams, RelativePathString } from "expo-router";
import { useAuth } from "@/components/contexts/SupabaseProvider";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";

export default function EnterNewPasswords() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const segments = useSegments();
    let title = "Set new password";

    if (segments[segments.length - 2] === "(signup)" || params?.existingUser === "true") {
        title = "Create a new password";
    }
    const toast = useToast();
    const { authForm, setAuthForm, updateUser } = useAuth();
    return (
        <>

            <Modal
                isOpen={router.canDismiss()}
                onClose={() => {
                    router.dismiss();
                }}
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader className="flex-col items-start gap-0.5">
                        <Heading>{title}</Heading>
                        <Text size="sm">
                            Almost done. Enter your new password and you are all set.
                        </Text>
                    </ModalHeader>
                    <ModalBody className="" contentContainerClassName="gap-3">
                        <Input>
                            <InputField placeholder="New password" />
                        </Input>
                        <Input>
                            <InputField placeholder="Confirm new password" />
                        </Input>
                    </ModalBody>
                    <ModalFooter className="flex-col items-start">
                        <Button
                            onPress={async () => {
                                //handle submit of valid values
                                if ([
                                    Object.values(authForm).every(Boolean),
                                    authForm.password === authForm.confirmPassword,
                                ].every(Boolean)) {
                                    await updateUser({
                                        password: authForm.password as string,
                                    });
                                    toast.show({
                                        duration: 3000,
                                        placement: "top",
                                        render: ({ id }) => (
                                            <Toast
                                                id={id}
                                                action="success"
                                                variant="solid"
                                                className="w-3/4 mx-auto mt-safe-area-inset-top flex-wrap gap-2"
                                            >
                                                <ToastTitle>
                                                    Password updated
                                                </ToastTitle>
                                                <ToastDescription>
                                                    Your password has been updated successfully."
                                                </ToastDescription>
                                            </Toast>

                                        ),
                                    });
                                } else {
                                    router.push("/auth/(signin)" as RelativePathString);
                                    toast.show({
                                        duration: 3000,
                                        placement: "top",
                                        render: ({ id }) => (
                                            <Toast
                                                id={id}
                                                action="error"
                                                variant="solid"
                                                className="w-3/4 mx-auto mt-safe-area-inset-top flex-wrap gap-2"
                                            >
                                                <ToastTitle>
                                                    Passwords do not match
                                                </ToastTitle>
                                                <ToastDescription>
                                                    Please make sure your passwords match.
                                                </ToastDescription>
                                            </Toast>

                                        ),
                                    });
                                }
                                setAuthForm({
                                    ...authForm,
                                    password: "",
                                    confirmPassword: "",
                                });

                            }}
                            className="w-full"
                        >
                            <ButtonText>Submit</ButtonText>
                        </Button>
                        <Button
                            variant="link"
                            size="sm"
                            onPress={() => {
                                router.push("/auth/(signin)" as RelativePathString);
                            }}
                            className="gap-1"
                        >
                            <ButtonIcon as={ArrowLeftIcon} />
                            <ButtonText>Back to login</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </>
    );
}