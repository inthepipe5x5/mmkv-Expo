import React from "react";
import { useRouter, Stack } from "expo-router";
import { useRouteTitle } from "@/hooks/useRouteTitle";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { ArrowLeftIcon } from "@/components/ui/icon";
import { useAuth } from "@/components/contexts/SupabaseProvider";


export default function ForgotPassword() {
    const router = useRouter();
    const { title } = useRouteTitle("Forgot Password?");
    const { authForm, setAuthForm, requestPasswordReset } = useAuth();
    
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
                        <Heading>Forgot password?</Heading>
                        <Text size="sm">No worries, we’ll send you reset instructions</Text>
                    </ModalHeader>
                    <ModalBody className="mb-4">
                        <Input>
                            <InputField placeholder="Enter your email" />
                        </Input>
                    </ModalBody>
                    <ModalFooter className="flex-col items-start">
                        <Button
                            onPress={async () => {

                            }}
                            className="w-full"
                        >
                            <ButtonText>Submit</ButtonText>
                        </Button>
                        <Button
                            variant="link"
                            size="sm"
                            onPress={() => {
                                router.push("/auth/(signin)");
                            }}
                            className="gap-1"
                        >
                            <ButtonIcon as={ArrowLeftIcon} />
                            <ButtonText>Back to login</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    );
}


