import { type Ref } from 'react'
import { Appearance, StyleSheet } from 'react-native'
import { CONTENT_GAP } from "@/constants/dimensions"
import Colors from '@/constants/Colors'
import { ScrollView } from 'react-native-gesture-handler'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { termsAndConditions } from "@/screens/auth/TermsAndConditionsContent.json"
import { Collapsible } from '@/components/Collapsible'
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
    Settings2
} from 'lucide-react-native'
import { VStack } from '@/components/ui/vstack'
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

    const ContactUs = () => <Collapsible
        title={"Support"}
    >
        <ThemedText
            type="default" >
            {contact.support}
        </ThemedText>
    </Collapsible>

    const Permissions = () => {
        const { description, required, optional } = permissions

        return (
            <ThemedView
                style={{
                    marginTop: CONTENT_GAP,
                    padding: CONTENT_GAP,
                    backgroundColor: accent,
                    borderRadius: 12,
                }}
                lightColor={Colors.light.background}
                darkColor={Colors.dark.background}
            >
                <ThemedText
                    type="default"
                    style={{
                        marginBottom: CONTENT_GAP,
                    }}
                >
                    {description}
                </ThemedText>
                <Collapsible title={"Required Permissions"}>
                    {Object.keys(required).sort((a: string, b: string) => a.localeCompare(b)).map((key) => {
                        const typedKey = key as "camera" | "email" | "notifications" | "storage" | "calendar";
                        const Icon = IconMapper(key)
                        return (
                            <ThemedView
                                key={key}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginBottom: CONTENT_GAP,
                                }}
                            >
                                <Icon size={18} color={accent} />
                                <VStack space="md">
                                    <ThemedText type="default">{required[typedKey].description}</ThemedText>
                                    <ThemedText type="subtitle">{required[typedKey].note}</ThemedText>
                                </VStack>
                            </ThemedView>
                        )
                    })}
                </Collapsible>
                <Collapsible title={"Optional Permissions"}>
                    <Collapsible title={"Required Permissions"}>
                        {Object.keys(optional).sort((a: string, b: string) => a.localeCompare(b)).map((key) => {
                            const typedKey = key as "location" | "contacts" | "socials";
                            const Icon = IconMapper(key)
                            return (
                                <ThemedView
                                    key={key}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                        marginBottom: CONTENT_GAP,
                                    }}
                                >
                                    <Icon size={18} color={accent} />
                                    <VStack space="md">
                                        <ThemedText type="default">{optional[typedKey].description}</ThemedText>
                                        <ThemedText type="subtitle">{optional[typedKey].note}</ThemedText>
                                    </VStack>
                                </ThemedView>
                            )
                        })}
                    </Collapsible>
                </Collapsible>
            </ThemedView>)
    }

    const DataUsage = () => (
        <Collapsible
            title={"Data Usage"}
        >
            <ThemedText
                type="default" >
                {dataUsage.statement}
            </ThemedText>
        </Collapsible>)

    const Header = () => (
        <ThemedView
            style={styles.header}
            lightColor={Colors.light.background}
            darkColor={Colors.dark.background}
        >
            <ThemedText type="title" style={styles.headerText}>{title}</ThemedText>
            <ThemedText type="defaultSemiBold">{introduction}</ThemedText>
        </ThemedView>
    )

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
        </ScrollView>
    )
}

const styles = StyleSheet.create({
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
    }
})