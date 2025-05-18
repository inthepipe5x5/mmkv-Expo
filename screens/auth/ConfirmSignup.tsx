import { forwardRef, useRef, type Ref, useImperativeHandle } from 'react'
import { type ViewStyle, Appearance, StyleSheet } from 'react-native'
import { TrueSheet, type TrueSheetProps } from '@lodev09/react-native-true-sheet'
import { CONTENT_GAP, viewPort } from "@/constants/dimensions"
import { Button, ButtonText } from "@/components/ui/button"
import Colors from '@/constants/Colors'
import { ScrollView } from 'react-native-gesture-handler'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { termsAndConditions } from "@/screens/auth/TermsAndConditionsContent.json"
import TermsAndConditionsContent from './TermsAndConditionsContent'
import { useStorageContext } from '@/components/contexts/StorageProvider'
import { SafeAreaView } from 'react-native-safe-area-context'


// This is a wrapper for the TrueSheet component that handles the Terms and Conditions sheet
// It uses a ref to control the sheet and a child sheet for the user agreement prompt
export default function ConfirmSignup() {
    const sheetRef = useRef<TrueSheet>(null)
    const childSheet = useRef<TrueSheet>(null)
    const scrollRef = useRef<ScrollView>(null)
    const { cache } = useStorageContext();
    const { background, accent } = Colors[Appearance.getColorScheme() as 'light' | 'dark']

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
            <TermsAndConditionsContent scrollRef={scrollRef} />
        </SafeAreaView>
    )
}

// const $content: ViewStyle = {
//     padding: CONTENT_GAP,
// }

const styles = StyleSheet.create({
    header: {
        padding: CONTENT_GAP,
        gap: CONTENT_GAP,
        backgroundColor: Colors.light.background,
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    scrollView: {
        flexGrow: 1,
        paddingBottom: CONTENT_GAP,
    },
    container: {
        flexWrap: 'wrap',
        padding: CONTENT_GAP,
        gap: CONTENT_GAP,
        backgroundColor: Colors.light.background,
    },
    buttons: {
        minHeight: viewPort.button.height,
        minWidth: viewPort.button.width,
        flexGrow: 1,
        borderRadius: 20,
        margin: CONTENT_GAP,

    }
})

// TermsAndConditionsSheet.displayName = 'TermsAndConditionsSheet'