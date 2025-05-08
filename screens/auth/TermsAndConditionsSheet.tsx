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

interface TermsAndConditionsSheetProps extends TrueSheetProps { }

// This is a wrapper for the TrueSheet component that handles the Terms and Conditions sheet
// It uses a ref to control the sheet and a child sheet for the user agreement prompt
export const TermsAndConditionsSheet = forwardRef((props: TermsAndConditionsSheetProps, ref: Ref<TrueSheet>) => {
    const sheetRef = useRef<TrueSheet>(null)
    const childSheet = useRef<TrueSheet>(null)
    const scrollRef = useRef<ScrollView>(null)
    const { cache } = useStorageContext();
    const { background, accent } = Colors[Appearance.getColorScheme() as 'light' | 'dark']
    const { userAgreement } = termsAndConditions

    const setAgreement = async () => {
        cache.setItem('userAgreement', new Date().toUTCString());
        console.log('User agreement set!', new Date(cache.getItem('userAgreement') as string).toLocaleTimeString());
        await Promise.all([childSheet.current?.dismiss(), sheetRef.current?.dismiss()])
        console.log('User agreement & child sheet dismissed!')
    }

    const resize = async (index: number) => {
        await sheetRef.current?.resize(index)
        console.log(`Basic sheet resize to ${index} async`)
    }

    const dismiss = async () => {
        await sheetRef.current?.dismiss()
        console.log('Basic sheet dismiss asynced')
    }

    const presentChild = async () => {
        // Note: no need to dismiss this sheet 😎
        await childSheet.current?.present()
        console.log('Child sheet presented!')
    }

    const presentConfirmSheet = async () => {
        // Note: we need to dismiss this sheet first
        await sheetRef.current?.dismiss()
        await TrueSheet.present('confirmTermsAndConditionsSheet', 1)
    }

    useImperativeHandle<TrueSheet | null, TrueSheet | null>(ref, () => sheetRef.current)

    return (
        <TrueSheet
            name="TermsAndConditionsSheet"
            sizes={['small', '100%']}
            ref={sheetRef}
            contentContainerStyle={$content}
            backgroundColor={background}
            cornerRadius={12}
            edgeToEdge
            // grabberProps={{ color: GRABBER_COLOR }}
            onDragChange={(e) =>
                console.log(
                    `drag changed with size of ${e.nativeEvent.value} at index: ${e.nativeEvent.index}`
                )
            }
            onDragBegin={(e) =>
                console.log(
                    `drag began with size of ${e.nativeEvent.value} at index: ${e.nativeEvent.index}`
                )
            }
            onDragEnd={(e) =>
                console.log(
                    `drag ended with size of ${e.nativeEvent.value} at index: ${e.nativeEvent.index}`
                )
            }
            onDismiss={() => console.log('Basic sheet dismissed!')}
            onPresent={(e) =>
                console.log(
                    `Basic sheet presented with size of ${e.nativeEvent.value} at index: ${e.nativeEvent.index}`
                )
            }
            onSizeChange={(e) =>
                console.log(`Resized to:`, e.nativeEvent.value, 'at index:', e.nativeEvent.index)
            }
            // FooterComponent={<Footer />}
            {...props}
            FooterComponent={
                <Button
                    style={styles.buttons}
                    android_ripple={{ color: accent }}
                    action="positive"
                    onHoverIn={() => resize(0)}
                    onPress={async () => await presentChild()}>
                    <ButtonText>Continue</ButtonText>
                </Button>
            }
            initialIndex={1}
            initialIndexAnimated={true}
        >
            <TermsAndConditionsContent
                scrollRef={scrollRef}
            />
            {/* <Button text="Dismiss" onPress={dismiss} /> */}

            <TrueSheet
                // id="TermsAndConditionsSheet"
                name="confirmTermsAndConditionsSheet"
                ref={childSheet}
                sizes={[`${0}%`, 'large', '100%']}
                backgroundColor={background}
                contentContainerStyle={$content}
                edgeToEdge
                cornerRadius={12}
                FooterComponent={
                    <ThemedView
                        lightColor={Colors["light"].background}
                        darkColor={Colors["dark"].background}
                    >
                        <ThemedText
                            type="title" >
                            Do you agree to our terms and conditions?
                        </ThemedText>
                        <ThemedText
                            type="subtitle" >
                            {userAgreement.statement}
                        </ThemedText>
                        <Button
                            style={styles.buttons}
                            android_ripple={{ color: accent }}
                            action="positive"
                            onHoverIn={() => resize(1)}
                            onPress={async () => setAgreement()}>
                            <ButtonText>I acknowledge</ButtonText>
                        </Button>
                    </ThemedView>
                }
            >
            </TrueSheet>
        </TrueSheet>
    )
})

const $content: ViewStyle = {
    padding: CONTENT_GAP,
}

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
        flexGrow: 1
    }
})

TermsAndConditionsSheet.displayName = 'TermsAndConditionsSheet'