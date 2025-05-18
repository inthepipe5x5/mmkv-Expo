import { useState, type Ref } from 'react'
import { Appearance, StyleSheet } from 'react-native'
import { CONTENT_GAP, viewPort } from "@/constants/dimensions"
import Colors from '@/constants/Colors'
import { ScrollView } from 'react-native-gesture-handler'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { termsAndConditions } from "@/screens/auth/TermsAndConditionsContent.json"
import { Card } from '@/components/ui/card'
import {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionTrigger,
    AccordionTitleText,
    AccordionIcon,
    AccordionContent,
} from "@/components/ui/accordion"
import {
    Button, ButtonText
} from "@/components/ui/button"
import {
    //required
    CameraIcon,
    MailsIcon,
    InboxIcon,
    FileTextIcon,
    Calendar1Icon,
    //optional
    MapPinIcon,
    LucideContact,
    BookHeartIcon,
    //misc
    Settings2,
    //accordion
    MinusIcon,
    PlusIcon
} from 'lucide-react-native'
import { VStack } from '@/components/ui/vstack'
import { Link } from 'expo-router'
import { HStack } from '@/components/ui/hstack'
import { capitalize } from '@/utils/string'
import { Pressable } from '@/components/ui/pressable'

//util func to map a permission obj key to an icon
const IconMapper = (key: string) => {
    switch (key) {
        case 'camera':
            return CameraIcon;
        case 'email':
            return MailsIcon;
        case 'notifications':
            return InboxIcon;
        case 'storage':
            return FileTextIcon;
        case 'calendar':
            return Calendar1Icon;

        case 'location':
            return MapPinIcon;
        case 'contacts':
            return LucideContact;
        case 'socials':
            return BookHeartIcon;
        default:
            return Settings2;
    }
};

export default function TermsAndConditionsContent({ scrollRef }: { scrollRef: Ref<ScrollView> }) {

    const { title, introduction, permissions, dataUsage, userAgreement, contact } = termsAndConditions
    const { background, accent } = Colors[Appearance.getColorScheme() as 'light' | 'dark']
    const [accordionValues, setAccordionValues] = useState<string[]>(["required", "optional"])
    //#region contact
    const ContactUs = () => <Card
        variant="filled"
    >
        <ThemedText
            type="title"
            style={{
                fontSize: 20,
                fontWeight: 'bold',
            }}
        >Contact Us

        </ThemedText>
        <ThemedText
            type="default" >
            {contact.support.split("at")[0]}
        </ThemedText>
        <Link
            href={`mailto:${contact.support.split("at")[1]}`}
            style={{
                marginTop: CONTENT_GAP,
                padding: CONTENT_GAP,
                backgroundColor: accent,
                borderRadius: 12,
            }}>
            <ThemedText
                type="default"
                style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: Colors.light.background,
                }}
            >{contact.support.split("at")[1]}
            </ThemedText>
        </Link>

    </Card>
    // #endregion
    //#region permissions

    const Permissions = () => {
        const { description, required, optional } = permissions

        return (
            <ThemedView
                style={{
                    marginVertical: CONTENT_GAP,
                    paddingVertical: CONTENT_GAP,
                    borderRadius: 12,
                    backgroundColor: background
                }}
                lightColor={Colors.light.background}
                darkColor={Colors.dark.background}
            >
                <Card
                    variant="elevated"
                >
                    <ThemedText
                        type="title"
                        style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                        }}
                    >Permissions
                    </ThemedText>
                    <ThemedText
                        type="default"
                        style={{
                            marginVertical: CONTENT_GAP,
                            paddingVertical: CONTENT_GAP,
                            fontSize: 16,
                        }}
                    >
                        {description}
                    </ThemedText>
                </Card>
                <Accordion
                    variant="filled"
                    type="multiple"
                    isCollapsible={true}
                    defaultValue={accordionValues}
                    onValueChange={(value) => {
                        console.log(value)
                        setAccordionValues(prevValue => [...prevValue, ...value])
                    }}
                >
                    <VStack space='lg'>
                        <AccordionItem value="required">
                            <AccordionHeader
                                style={{
                                    justifyContent: "flex-start",
                                }}
                            >
                                <AccordionTrigger>
                                    {({ isExpanded }) => {
                                        return (
                                            <Pressable
                                                onPress={() => setAccordionValues(prevValue => prevValue.includes("required") ? prevValue.filter(v => v !== "required") : [...prevValue, "required"])}
                                                android_ripple={{ color: accent }}
                                            >
                                                <AccordionTitleText
                                                    size="lg"
                                                    style={styles.accordionTitle}
                                                >
                                                    Required Permissions
                                                </AccordionTitleText>
                                                {isExpanded ? (
                                                    <AccordionIcon as={MinusIcon} className="ml-3 flex-end" />
                                                ) : (
                                                    <AccordionIcon as={PlusIcon} className="ml-3 flex-end" />
                                                )}
                                            </Pressable>
                                        )
                                    }}
                                </AccordionTrigger>
                                <ThemedText
                                    type="default"
                                    style={{ padding: CONTENT_GAP }}
                                >These are system permissions required for the app to function properly.
                                </ThemedText>
                            </AccordionHeader>
                            <AccordionContent>
                                {Object.keys(required)
                                    .sort((a: string, b: string) => a.localeCompare(b))
                                    .map((key) => {
                                        const typedKey = key as "camera" | "email" | "notifications" | "storage" | "calendar";
                                        const Icon = IconMapper(key)
                                        return (
                                            <ThemedView
                                                key={key}
                                                style={{
                                                    flexDirection: 'column',
                                                    gap: 6,
                                                    padding: CONTENT_GAP,
                                                }}
                                            >
                                                <HStack
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                    }}
                                                >
                                                    <Icon size={24} color={accent} />
                                                    <ThemedText type="subtitle">{capitalize(typedKey)}</ThemedText>
                                                </HStack>
                                                <VStack space="md">
                                                    {/* <ThemedText type="defaultSemiBold">Useage</ThemedText> */}
                                                    <ThemedText type="default">{required[typedKey].description}</ThemedText>
                                                    <ThemedText type="defaultSemiBold">Note</ThemedText>
                                                    <ThemedText type="default">{required[typedKey].note}</ThemedText>
                                                </VStack>
                                            </ThemedView>
                                        )
                                    })}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="optional" >
                            <AccordionHeader
                                style={{
                                    justifyContent: "flex-start",
                                    marginLeft: 5
                                }}
                            >
                                <AccordionTrigger className="w-full">
                                    {({ isExpanded }) => {
                                        return (
                                            <Pressable
                                                android_ripple={{ color: accent }}
                                                onPress={() =>
                                                    setAccordionValues(prevValue => prevValue.includes("optional") ? prevValue.filter(v => v !== "optional") : [...prevValue, "optional"])}
                                            >
                                                <AccordionTitleText
                                                    size="lg"
                                                    style={styles.accordionTitle}
                                                >
                                                    Optional Permissions
                                                </AccordionTitleText>
                                                {isExpanded ? (
                                                    <AccordionIcon as={MinusIcon}
                                                        className="ml-3 flex-end" />
                                                ) : (
                                                    <AccordionIcon as={PlusIcon}
                                                        className="ml-3 flex-end" />
                                                )}
                                            </Pressable>
                                        )
                                    }}
                                </AccordionTrigger>
                                <ThemedText
                                    type="default"
                                    style={{ padding: CONTENT_GAP }}
                                >By not enabling these functions, your experience in the app may be affected but still have access to the core functionality.</ThemedText>
                            </AccordionHeader>

                            <AccordionContent>
                                {Object.keys(optional)
                                    .sort((a: string, b: string) => a.localeCompare(b))
                                    .map((key) => {
                                        const typedKey = key as "location" | "contacts" | "socials";
                                        const Icon = IconMapper(key)
                                        return (
                                            <ThemedView
                                                key={key}
                                                style={{
                                                    flexDirection: 'column',
                                                    gap: 6,
                                                    marginVertical: CONTENT_GAP,
                                                }}
                                            >
                                                <HStack
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                    }}
                                                >
                                                    <Icon size={24} color={accent} />
                                                    <ThemedText type="subtitle">{capitalize(typedKey)}</ThemedText>
                                                </HStack>
                                                <VStack space="md">
                                                    {/* <ThemedText type="defaultSemiBold">Useage</ThemedText> */}
                                                    <ThemedText type="default">{optional[typedKey].description}</ThemedText>
                                                    <ThemedText type="defaultSemiBold">Note</ThemedText>
                                                    <ThemedText type="default">{optional[typedKey].note}</ThemedText>
                                                </VStack>
                                            </ThemedView>
                                        )
                                    })}
                            </AccordionContent>
                        </AccordionItem>
                    </VStack>
                </Accordion>
            </ThemedView >)
    }
    // #endregion
    //#region data
    const DataUsage = () => (
        <Card
            variant="filled"
        >
            <ThemedText
                type="title"
                style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                }}
            >Data Usage
            </ThemedText>
            <ThemedText
                type="default" >
                {dataUsage.statement}
            </ThemedText>
        </Card>)
    // #endregion
    // #region header
    const Header = () => (
        <ThemedView
            style={styles.header}
            lightColor={Colors.light.background}
            darkColor={Colors.dark.background}
        >
            <Card
                variant="filled"
            >
                <ThemedText type="title" style={styles.headerText}>{title}</ThemedText>
                <ThemedText type="defaultSemiBold">{introduction}</ThemedText>
            </Card>
        </ThemedView>
    )
    // #endregion
    return (
        <ScrollView
            ref={scrollRef}
            bounces={true}
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Header />
            <Permissions />
            <ContactUs />
            <DataUsage />
            <ThemedView
                lightColor={Colors["light"].background}
                darkColor={Colors["dark"].background}
                style={{
                    marginBottom: 20
                }}
            >
                <ThemedText
                    type="defaultSemiBold" >
                    Do you agree to our terms and conditions?
                </ThemedText>
                <ThemedText
                    type="default" >
                    {userAgreement.statement}
                </ThemedText>
                <Button
                    style={styles.buttons}
                    android_ripple={{ color: accent }}
                    action="positive"
                    onPress={async () => {
                        console.log("User agreed to terms and conditions" + userAgreement.statement)
                    }}>
                    <ButtonText>I acknowledge</ButtonText>
                </Button>
            </ThemedView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        marginBottom: 100,
    },
    container: {
        flexShrink: 1,
        padding: CONTENT_GAP,
        gap: CONTENT_GAP,
        backgroundColor: Colors.light.background,
    },
    accordionTitle: {
        fontSize: 20,
        fontWeight: 500,
        color: Colors.light.text,
        marginLeft: 5,
    },
    header: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    buttons: {
        minHeight: viewPort.button.height,
        minWidth: viewPort.button.width,
        flexGrow: 1,
        borderRadius: 20,
        margin: CONTENT_GAP,

    }
})