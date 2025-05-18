import ConfirmAuthScreen from "@/screens/auth/ConfirmAuthScreen";
export const unstable_settings = {
    initialRouteName: "signin",
    signup: {
        initialRouteName: "confirm"
    },
    password: {
        initialRouteName: "index"
    }
}
export default function Confirm() {
    return (
        <ConfirmAuthScreen />
    )
}