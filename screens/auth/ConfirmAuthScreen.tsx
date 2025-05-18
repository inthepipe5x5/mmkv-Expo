/** Reusuable dialog component for confirming authentication on various confirm screens in /auth
 *  
 */

import React, { useCallback, useMemo, useState } from "react";
import { SplashScreen, Stack, useLocalSearchParams, useRouter, useSegments } from "expo-router";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader
} from "@/components/ui/alert-dialog";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { ChevronLeft, Lock } from "lucide-react-native";
import { Alert, Platform } from "react-native";
import { current } from "immer";
import { useRouteTitle } from "@/hooks/useRouteTitle";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import { useAuthFlow } from "@/components/contexts/AuthFlowContext";
import { FieldValues } from "react-hook-form";
import { useMutationState } from "@tanstack/react-query";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
//#region AlertComponent
export const AlertComponent: React.FC<{
    screenTitle?: string | null | undefined,
    primaryActionText?: string | null | undefined,
    primaryAction?: () => Promise<void>,
    cancelActionText?: string | null | undefined,
    cancelAction?: () => void,
    children?: React.ReactNode | null | undefined,
}> = ({
    primaryActionText,
    primaryAction,
    cancelAction,
    cancelActionText,
    screenTitle,
    children
}) => {
        const router = useRouter();
        //useSegments is used to get the current route segments
        const segments = useSegments();
        //#region dismiss alert dialog
        const onDismissAlertDialog = useCallback(() => cancelAction ?? (() => {
            return router.dismiss()
        }), []);

        //#region onPrimaryAction
        //onPrimaryAction is called when the primary action button is pressed 
        const onPrimaryAction = useCallback(async () => {
            if (!!primaryAction) {
                await primaryAction();
            }
            //dismiss the alert dialog
            onDismissAlertDialog();
        }, [])
        //#endregion

        return (
            <AlertDialog
                isOpen={router.canDismiss()}
                defaultIsOpen={router.canDismiss()}
                onClose={onDismissAlertDialog}
                avoidKeyboard={true}
                closeOnOverlayClick={false}
                isKeyboardDismissable={true}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent className="max-w-[305px] items-center">
                    <AlertDialogHeader>
                        <AlertDialogCloseButton onPress={onDismissAlertDialog} />
                        <Icon as={Lock} className="text-background-50" size="xl" />
                        <Heading
                            bold={true}
                            size="md"
                        >
                            {screenTitle ?? "Please confirm before proceeding"}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-0 mb-4">
                        <VStack space="md" className="w-full items-center">
                            {children ? children : null}
                        </VStack>
                    </AlertDialogBody>
                    <AlertDialogFooter
                        className="w-full justify-around align-baseline"
                    >
                        <Button
                            className="absolute top-4 right-4"
                            variant="outline"
                            action="secondary"
                            size="sm"
                            onPress={onDismissAlertDialog}
                        >
                            <ButtonText>{cancelActionText ?? "Cancel"}</ButtonText>
                            <ButtonIcon as={ChevronLeft} className="text-background-50" size="sm" />
                        </Button>
                        <Button
                            onPress={onPrimaryAction}
                            className="flex-grow"
                            action="primary"
                            variant="solid"
                        >
                            <ButtonText>{primaryActionText ?? "Confirm"}</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }
//#endregion 
//#region ConfirmAuthScreen
export default function ConfirmAuthScreen() {
    const router = useRouter();
    const toast = useToast();
    const params = useLocalSearchParams<{
        title?: string[];
        presentation?: ("formSheet" | "transparentModal" | "modal" | "containedModal" | "containedTransparentModal" | "fullScreenModal" | "card")[] | undefined;
        headerShown?: ("true" | "false")[];
    }>();
    const routeTitle = useRouteTitle("Please confirm before proceeding");

    //if params.presentation is an array, destructure it
    //and assign the first element to screenPresentation
    const [screenPresentation] = (params?.presentation ?? Platform.select({
        ios: ["formSheet"],
        android: ["transparentModal"],
        default: ["modal"]
    })) as ("formSheet" | "transparentModal" | "modal" | "containedModal" | "containedTransparentModal" | "fullScreenModal" | "card" | undefined)[];

    const { processed: screenTitle } = routeTitle.formatSegmentName(Array.isArray(params.title) ? params.title[0] : routeTitle.title);

    const { onSubmit, form, mutationState } = useAuthFlow();
    const { isPending, isError, error, isSuccess } = mutationState

    if (isPending) {
        SplashScreen.preventAutoHideAsync();
    }
    if (isError) {
        SplashScreen.hideAsync();
        toast.show({
            placement: "top",
            duration: 5000,
            render: ({ id }) => (
                <Toast
                    nativeID={id}
                    variant="solid"
                    action="error"
                >
                    <ToastTitle>Failed Auth Request</ToastTitle>
                    <ToastDescription>{
                        error !== null ? JSON.stringify(error, null, 4) : "Request failed!"}
                    </ToastDescription>
                </Toast>
            ),
        });
    }

    if (isSuccess) {
        SplashScreen.hideAsync();
        form.reset();
        toast.show({
            placement: "top",
            duration: 5000,
            render: ({ id }) => (
                <Toast
                    nativeID={id}
                    variant="solid"
                    action="success"
                >
                    <ToastTitle>Success</ToastTitle>
                    <ToastDescription>Authentication successful!</ToastDescription>
                </Toast>
            ),
        });
    }

    return (
        <SafeAreaView className="flex-1">
            <Stack.Screen
                options={{
                    presentation: screenPresentation
                }}
            />
            <AlertComponent
                primaryActionText="Confirm"
                primaryAction={async () => await onSubmit(form.getValues())}
                screenTitle={screenTitle}
            >

            </AlertComponent>
        </SafeAreaView>
    )

}

//#region default export 
