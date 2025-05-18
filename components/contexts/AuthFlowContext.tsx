import { createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import { useForm, UseFormReturn, FieldValues, useWatch } from "react-hook-form";
import { z, ZodSchema } from "zod";
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { RelativePathString, useRouter, useSegments } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useRouteTitle } from "@/hooks/useRouteTitle";

interface AuthFlowContextProps<T extends FieldValues = FieldValues> {
    form: UseFormReturn<T>;
    onSubmit: (data: T) => Promise<void>;
    mutationState: Omit<ReturnType<typeof useMutation>, "mutate" | "mutateAsync">
}

const AuthFlowContext = createContext<AuthFlowContextProps<any> | undefined>(undefined);

type AuthFlowProviderProps<T extends FieldValues = FieldValues> = {
    children: ReactNode;
    schema: ZodSchema<T>;
    mutationFn: (data: T) => Promise<any>;
    redirectToOnSuccess?: RelativePathString; // optional, like "/dashboard"
};

export function AuthFlowProvider<T extends FieldValues = FieldValues>({
    children,
    schema,
    mutationFn,
    redirectToOnSuccess = "/(tabs)" as RelativePathString,
}: AuthFlowProviderProps<T>) {
    const toast = useToast();
    const router = useRouter();
    const segments = useSegments();

    const { title: routeTitle } = useRouteTitle("Auth request", { case: "capitalize" });

    const form = useForm<T>({
        resolver: async (values) => {
            try {
                const data = await schema.parseAsync(values);
                return { values: data, errors: {} };
            } catch (error: any) {
                return { values: {}, errors: error.formErrors?.fieldErrors ?? {} };
            }
        },
        resetOptions: {
            keepDirtyValues: true,
            keepDirty: true,
            keepIsSubmitted: true,
        },
        reValidateMode: "onBlur",
    });

    const { mutateAsync, ...mutationState } = useMutation({
        mutationKey: [segments[segments.length - 1], segments[segments.length - 2]],
        mutationFn,
        onSuccess: () => {
            toast.show({
                duration: 3000,
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={id} variant="solid" action="success">
                        <ToastTitle>Success!</ToastTitle>
                        <ToastDescription>{routeTitle} successful!</ToastDescription>
                    </Toast>
                ),
            });
            form.reset();
            if (redirectToOnSuccess) {
                router.replace(redirectToOnSuccess);
            }
        },
        onError: (error: any) => {
            console.error(error);
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={id} variant="solid" action="error">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>{error?.message ?? "An unexpected error occurred."}</ToastDescription>
                    </Toast>
                ),
            });
        },
    });

    const onSubmit = useCallback(
        async (data: T) => {
            try {
                await mutateAsync(data);
            } catch (err) {
                console.error("Submission error:", err);
            }
        },
        [mutateAsync]
    );

    const value = useMemo(() => {
        return {
            form,
            onSubmit,
            mutationState,
            redirectToOnSuccess
        }
    }, [form, onSubmit, mutationState, redirectToOnSuccess]);

    return (
        <AuthFlowContext.Provider
            value={value as AuthFlowContextProps<T>}
        >
            {children}
        </AuthFlowContext.Provider>
    );
}

export function useAuthFlow<T extends FieldValues = FieldValues>() {
    const context = useContext(AuthFlowContext);
    if (!context) {
        throw new Error("useAuthFlow must be used inside an AuthFlowProvider.");
    }
    return context as AuthFlowContextProps<T>;
}
