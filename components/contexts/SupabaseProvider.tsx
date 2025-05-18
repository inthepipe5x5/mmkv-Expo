import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { SplashScreen, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import supabase from "@/lib/supabase/supabase"
// import { useMMKVObject } from "react-native-mmkv";
import { useImmer } from "use-immer";

import { useStorageContext } from "@/components/contexts/StorageProvider";
import { ToastComponentProps } from "@gluestack-ui/toast/lib/types";
import { Toast, ToastDescription, ToastTitle, useToast } from "../ui/toast";
import { useMMKVObject } from "react-native-mmkv";
import { useScreenHistory } from "./ScreenHistoryContext";

SplashScreen.preventAutoHideAsync();
export type authFormType = {
    email?: string;
    password?: string;
    confirmPassword?: string;
    termsAccepted?: boolean;
    resetTokenVerified?: string;
    [key: string]: any;
};

type AuthState = {
    initialized: boolean;
    authenticated?: boolean;
    authForm: authFormType;
    setAuthForm: (form: object) => void;
    authUser: User | null;
    setAuthUser?: (user: User | null) => void;
    session: Session | null;
    setSession?: (session: Session | null) => void;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>,
    updateUser: (userData: Partial<User>) => Promise<void>,
};

export const AuthContext = createContext<AuthState>({
    initialized: false,
    session: null,
    authUser: null,
    setAuthUser: () => { },
    setSession: () => { },
    signUp: async () => { },
    signIn: async () => { },
    signOut: async () => { },
    authenticated: false,
    authForm: {},
    setAuthForm: () => { },
    requestPasswordReset: async () => { },
    updateUser: async () => { },
});

//#region provider
export function AuthProvider({ children }: PropsWithChildren) {
    const [initialized, setInitialized] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    // const [authUser, setAuthUser] = useState<User | null>(null);
    const [authUser, setAuthUser] = useMMKVObject<User | null>("authUser", useStorageContext().cache.storage);
    const [authForm, setAuthForm] = useImmer({
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
        resetTokenVerified: "", // This is the token sent to the user for password reset
    });

    const toast = useToast();
    const router = useRouter();
    const { cache } = useStorageContext();
    const { clear } = useScreenHistory();

    //#region methods
    const signUp = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error("Error signing up:", error);
            return;
        }

        if (data.session) {
            setSession(data.session);
            cache.setItem("authSession", JSON.stringify(data.session));
            cache.setItem("authUser", JSON.stringify(data?.session?.user));
            console.log("User signed up:", data.user);
        } else {
            console.log("No user returned from sign up");
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Error signing in:", error);
            return;
        }

        if (data.session) {
            setSession(data.session);
            console.log("User signed in:", data.user);
            //clear the screen history
            clear();
        } else {
            console.log("No user returned from sign in");
        }
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Error signing out:", error);
            return;
        } else {
            console.log("User signed out");
            setSession(null);
            setAuthUser(null);
            // Clear the authUser from cache
            cache.clear();
            //clear the screen history
            clear();
        }
    }, []);

    const requestPasswordReset = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: Linking.createURL("/auth/create-password") + "?existingUser=true"
        });
        if (error) {
            console.error("Error resetting password:", error);
            toast.show({
                duration: 5000,
                placement: "top",
                render: ({ id }: ToastComponentProps) => (
                    <Toast
                        nativeID={id}
                        variant="solid"
                        action="error"
                        className="margin-top-5 p-5 flex-wrap"
                    >
                        <ToastTitle>Error resetting password</ToastTitle>
                        <ToastDescription>{error?.message ?? "Please try again"}</ToastDescription>
                    </Toast>
                ),
            })
            return;
        }
        toast.show({
            duration: 5000,
            placement: "top",
            render: ({ id }: ToastComponentProps) => (
                <Toast
                    nativeID={id}
                    variant="solid"
                    action="success"
                    className="margin-top-5 p-5 flex-wrap"
                >
                    <ToastTitle>Password reset</ToastTitle>
                    <ToastDescription>{`Password reset email sent to ${email}`}</ToastDescription>
                </Toast>
            ),
        })

        return;
    }, [toast]);

    const updateUser = useCallback(async (userData: Partial<User>) => {
        const { data, error } = await supabase
            .auth
            .updateUser(userData);

        if (error) {
            console.error("Error updating user:", error);
            toast.show({
                duration: 5000,
                placement: "top",
                render: ({ id }: ToastComponentProps) => (
                    <Toast
                        nativeID={id}
                        variant="solid"
                        action="error"
                        className="margin-top-5 p-5 flex-wrap"
                    >
                        <ToastTitle>Error updating user</ToastTitle>
                        <ToastDescription>{error?.message ?? "Please try again"}</ToastDescription>
                    </Toast>
                ),
            })
            return;
        }
        return data;
    }, [toast]);

    const authenticated = useMemo((): boolean => {
        // Check if the session is valid and not expired
        if ([session,
            session?.user,
            session?.access_token,
            session?.refresh_token,
            session?.user?.aud === "authenticated",
            session?.expires_at,
        ].every(Boolean)) return true;

        return false;
    }, [session])
    //#endregion methods

    //#region effects
    useEffect(() => {
        const initSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error || session === null) {
                toast.show({
                    duration: 5000,
                    placement: "top",
                    render: ({ id }: ToastComponentProps) => (
                        <Toast
                            nativeID={id}
                            variant="outline"
                            action="error"
                            className="margin-top-5 p-5 flex-wrap"
                        >
                            <ToastTitle>Error retrieving session </ToastTitle>
                            <ToastDescription>{error?.message ?? "Please login"}</ToastDescription>
                        </Toast>
                    ),
                })
            }
            setSession(session as Session);
            setAuthUser(session?.user ?? null);
            toast.show({
                duration: 5000,
                placement: "top",
                render: ({ id }: ToastComponentProps) => (
                    <Toast
                        nativeID={id}
                        variant="solid"
                        action="success"
                        className="margin-top-5 p-5 flex-wrap"
                    >
                        <ToastTitle>Session retrieved</ToastTitle>
                        <ToastDescription>{session ? "Session retrieved successfully" : "No session found"}</ToastDescription>
                    </Toast>
                )
            });
        }
        initSession()
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            let toastType = "info" as "success" | "info" | "error"
            // ToastComponentProps["variant"];
            switch (_event as AuthChangeEvent) {
                case "INITIAL_SESSION":
                    return;
                case "SIGNED_IN":
                    toastType = "success";
                    break;
                case "SIGNED_OUT":
                    toastType = "info";
                    break;
                case "USER_UPDATED":
                    toastType = "info";
                    break;
                case "PASSWORD_RECOVERY":
                    toastType = "info";
                    //update authForm to include the reset token
                    setAuthForm((draft: authFormType) => {
                        draft.resetTokenVerified = session?.access_token ?? "";
                        draft.email = session?.user?.email ?? "";
                    });
                    break;
                case "TOKEN_REFRESHED":
                    toastType = "info";
                    break;
                default:
                    toastType = "error";
            }
            const event = (_event[0] + (_event).replace("_", " ").toLowerCase().slice(1))

            toast.show({
                duration: 5000,
                placement: "top",
                avoidKeyboard: true,
                render: ({ id }: ToastComponentProps) => (
                    <Toast
                        nativeID={id}
                        variant="solid"
                        action={toastType}
                        onLayout={(e) => {
                            console.log("Toast layout", e.nativeEvent.layout);
                            console.log("Toast event", _event);
                        }}
                        className="mt-safe-or-16 p-5 flex-wrap"

                    >
                        <ToastTitle>{`${event.replace("_", " ").toLowerCase()} ${toastType}!`}</ToastTitle>
                        <ToastDescription>Supabase Event: {event.replace("_", " ").toLowerCase()} completed</ToastDescription>
                    </Toast>
                ),
            })
        });

        setInitialized(true);

        return () => {
            data.subscription.unsubscribe();
        };
    }, [toast]);

    useEffect(() => {
        if (initialized) {
            SplashScreen.hideAsync();
            if (!!session) {
                router.replace("/(tabs)");
            } else {
                router.replace("/auth");
            }
            supabase.auth.startAutoRefresh();
        }

        return () => {
            supabase.auth.stopAutoRefresh(); // Cleanup function to stop auto-refresh on unmount
        };
        // eslint-disable-next-line
    }, [initialized, session]);
    // #endregion effects
    //#region context value
    const contextValue = useMemo(() => {
        return {
            initialized,
            authUser,
            setAuthUser,
            session,
            setSession,
            signUp,
            signIn,
            signOut,
            authenticated,
            requestPasswordReset,
            updateUser,
            authForm,
            setAuthForm,
        };
    }, [initialized,
        session,
        signUp,
        signIn,
        signOut,
        authenticated,
        requestPasswordReset,
        updateUser,
        authForm,
        setAuthForm]);


    //#region provider
    return (
        <AuthContext.Provider
            value={contextValue}
        >
            {children}
        </AuthContext.Provider>
    );
}

// #region hooks
export const useAuth = () => useContext(AuthContext);

