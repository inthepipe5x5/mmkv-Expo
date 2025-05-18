import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import { Image } from "expo-image";
import { useState, useContext } from "react";
import { Divider } from "@/components/ui/divider";
import {
    InterfaceToastProps,
    ToastPlacement,
} from "@gluestack-ui/toast/lib/types";
// import GoogleSigninButtonComponent from "@/components/GoogleSignInButton";

import { useAuth } from "@/components/contexts/SupabaseProvider";
import { useRouter } from "expo-router";
import { Appearance, Dimensions } from "react-native";
import PromptText from "@/components/PromptText";
import { light, dark } from "@/constants/Colors";

export type AuthLayoutProps = {
    children: React.ReactNode;
    portals?:
    | {
        HeadingText: string;
        SubtitleText: string;
        link: {
            href: string;
            isExternal: boolean;
            text: string;
        };
        CardImage: React.JSX.Element;
    }[]
    | undefined;
    next?: string; // next auth page to navigate to
    prev?: string; // previous auth page to navigate to
    title?: string; // title of the auth page
    mutationFn?: (args: any) => any; // mutation function to be called;
    showSSOProviders?: boolean; // show SSO providers
    showCancelAlert?: boolean; // show alert

    submitSuccessDispatchObject?: {
        type: string;
        payload: any;
    }; // dispatch object to be called on submit success
    submitErrorDispatchObject?: {
        type: string;
        payload: any;
    }; // dispatch object to be called on submit failure
    submitText?: string; // submit button text
    submitSuccessToastObject?: InterfaceToastProps;
    submitErrorToastObject?: InterfaceToastProps;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    const router = useRouter();
    const colorScheme = Appearance.getColorScheme() ?? "light";
    const { background } = colorScheme === "dark" ? dark : light;
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
            {/* <ScrollView
        className="w-full h-full"
      // contentContainerStyle={{ flexGrow: 1 }}
      > */}
            <HStack className="w-full h-full bg-background-0 flex-grow justify-center">
                <VStack className="md:items-center md:justify-center flex-1 w-full  p-9 md:gap-10 gap-16 md:m-auto md:w-1/2 h-full">
                    {/* {displayAlert ? (
                        <PromptText {
                            title = "Are you sure you want to cancel?"
                            description="You will lose any unsaved changes."
                            onCancel={() => {
                                setDisplayAlert(false);
                            }}
                            onConfirm={() => {
                                setDisplayAlert(false);
                                router.back();
                            }}
                        }/>
                    ) : null} */}

                    {children}

                    {/* show SSO providers social login buttons 
             * 
             */

                        /*props.showSSOProviders ? (
                           <VStack className="w-full" space="md">
                             <Divider className="my-2" />
                             <GoogleSigninButtonComponent />
                           </VStack>
                         ) : null
                         */
                    }
                    {/* <Divider className="my-1" /> */}
                </VStack>
                <VStack
                    className="relative hidden md:flex h-full w-full flex-1  items-center  justify-center"
                    space="md"
                >
                    <Image
                        source={require("@/assets/images/DarkMode_welcomeCard.png")}
                        // source={require("@/assets/images/splash-icon.png")}
                        className="object-cover h-full w-full"
                        alt="Welcome Card"
                        placeholder={require("@/assets/images/auth/auth-required.png")}
                    />
                    {/* {props.children.alt} */}
                    {/* <AltAuthLeftBackground
                        authPortals={props.portals ? props.portals : defaultAuthPortals}
                    /> */}
                </VStack>
            </HStack>
            {/* </ScrollView> */}
        </SafeAreaView >
    );
};
