import React, { forwardRef, useImperativeHandle } from "react";
import { TrueSheet, TrueSheetProps } from "@lodev09/react-native-true-sheet";
import { SignInForm } from "@/screens/auth/SignIn";

//#region sheet id
export const AUTH_SHEET_ID = "SIGN_IN_SHEET";
//#endregion

interface AuthSheetProps extends TrueSheetProps { }

const AuthSheet = forwardRef((props: AuthSheetProps, ref: React.Ref<TrueSheet>): React.ReactElement => {
    const sheetRef = React.useRef<TrueSheet>(null);

    useImperativeHandle<TrueSheet | null, TrueSheet | null>(ref, () => sheetRef.current)

    return (
        <TrueSheet
            name="SIGN_IN_SHEET"
            sizes={["auto", "100%"]}
            ref={sheetRef}
            onMount={() => {
                console.log("AuthSheet mounted!");
            }}
            onDismiss={() => {
                console.log("AuthSheet dismissed!");
            }}
            {...props}
        >
            <SignInForm />
        </TrueSheet>
    );
})

AuthSheet.displayName = "SIGN_IN_SHEET";

export default AuthSheet;