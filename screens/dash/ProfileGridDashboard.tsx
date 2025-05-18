import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { isWeb } from "@gluestack-ui/nativewind-utils/IsWeb";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { ScrollView } from "@/components/ui/scroll-view";
import { Divider } from "@/components/ui/divider";
import { Grid, GridItem } from "@/components/ui/grid";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/screens/dash/_layout";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { useStorageContext } from "@/components/contexts/StorageProvider";
import { CalendarIcon } from "lucide-react-native";
import { useSessionResourceContext } from "@/components/contexts/UserHouseholdsContext";
import { Link, Redirect } from "expo-router";
import { useState } from "react";

interface CardData {
    bannerUri: string;
    title: string;
    description: string;
}
interface TasksCardData {
    icon: any;
    title: string;
    description: string;
}
interface ProductsCardData {
    title: string;
    description: string;
    quantityPercent: number; //calculate this from current_quantity and max_quantity
    isDisabled: boolean;
}
interface HouseholdMembersCardData {
    image: any;
    title: string;
    access_level: string;
}

const HeadingCards: CardData[] = [
    { //for new users only
        bannerUri: require("@/assets/image.png"),
        title: "Update your profile",
        description: "Add your details",
    },
    {
        bannerUri: require("@/assets/image2.png"),
        title: "Your products",
        description: "Add your products here",
    },
    {
        bannerUri: require("@/assets/image3.png"),
        title: "Your tasks",
        description: "Manage your tasks",
    },
    {
        bannerUri: require("@/assets/image3.png"),
        title: "Your Inventories",
        description: "Organize your products & inventories",
    },
    {
        bannerUri: require("@/assets/image3.png"),
        title: "Your households",
        description: "Review your households",
    },
];
const TasksCards: TasksCardData[] = [
    {
        icon: CalendarIcon,
        title: "Do this task",
        description: "12 March, Monday (Optional holiday)",
    },
    {
        icon: CalendarIcon,
        title: "Check this product",
        description: "12 October, Tuesday",
    },
    {
        icon: CalendarIcon,
        title: "Restock all food products",
        description: "12 March, Wednesday",
    },
];
const ProductsCards: ProductsCardData[] = [
    {
        title: "Product A",
        description: "Available 24",
        quantityPercent: 24,
        isDisabled: false,
    },
    {
        title: "Product B",
        description: "Available 24",
        quantityPercent: 24,
        isDisabled: false,
    },
    {
        title: "Menstrual Products",
        description: "Available 20",
        quantityPercent: 20,
        isDisabled: false,
    },
    {
        title: "Optional Products",
        description: "Available 0",
        quantityPercent: 0,
        isDisabled: true,
    },
];
const HouseholdMembersCards: HouseholdMembersCardData[] = [
    {
        image: { uri: process.env.EXPO_PUBLIC_RANDOM_AVATAR_API as string + "/public/girl" },
        title: "Emily Zho",
        access_level: "member",
    },
    {
        image: { uri: process.env.EXPO_PUBLIC_RANDOM_AVATAR_API as string + "/public/girl" },
        title: "Marilyn Monroe",
        access_level: "member",
    },
    {
        image: { uri: process.env.EXPO_PUBLIC_RANDOM_AVATAR_API as string + "/public/boy" },
        title: "James Kant",
        access_level: "manager",
    },
    {
        image: { uri: process.env.EXPO_PUBLIC_RANDOM_AVATAR_API as string + "/public/boy" },
        title: "Richard Faynmen",
        access_level: "guest",
    },
];
// import { CalendarIcon } from "./assets/icons/calendar";

//#region content
const MainContent = () => {
    const { cache } = useStorageContext();
    const { currentProfile, householdList } = useSessionResourceContext();

    if (currentProfile === null) {
        return <Redirect href="/auth" />;
    }

    const FinishSetUpMessage = () => {
        const [hidden, setHidden] = useState(false);
        if (hidden) return null;

        const HideButton = () => (
            <Button
                variant="link"
                action="secondary"
                size="xs"
                onPress={() => {
                    setHidden(true);
                }}
            >
                <ButtonText>Hide</ButtonText>
            </Button>
        );

        if (currentProfile.draft_status === "draft") {
            return (
                <Box className="bg-warning-50 p-4 rounded-md">
                    <Text className="text-center font-medium">
                        You need to finish setting up your profile. Please click the link below to your profile
                        settings and finish setting up your profile.
                    </Text>
                    <Link
                        href="/profile/setup" // update to a valid route as per your router config
                        asChild
                    >
                        <Text>Finish setting up your profile</Text>
                    </Link>
                    <HideButton />
                </Box>
            );
        }
        if (householdList.length === 0) {
            return (
                <Box className="bg-warning-50 p-4 rounded-md">
                    <Text className="text-center font-medium">
                        You need to finish setting up your household or join an existing one.
                    </Text>
                    <Link
                        href="/households" // update to a valid route as per your router config
                        asChild
                    >
                        <Text>Finish setting up your profile</Text>
                    </Link>
                    <HideButton />
                </Box>
            );
        }
        return null;
    }

    return (
        <Box className="flex-1 ">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: isWeb ? 0 : 100,
                    flexGrow: 1,
                }}
                className="flex-1 mb-20 md:mb-2"
            >
                <VStack className="p-4 pb-0 md:px-10 md:pt-6  w-full" space="2xl">
                    <Heading size="2xl" className="font-roboto">
                        Welcome {currentProfile.name}!
                    </Heading>

                    <Grid
                        _extra={{
                            className: "gap-5",
                        }}
                        className="gap-5">
                        {HeadingCards.map((item, index) => {
                            return (
                                <GridItem
                                    _extra={{
                                        className: "col-span-12 sm:col-span-6 lg:col-span-4",
                                    }}
                                    key={index}
                                >
                                    <HStack
                                        space="md"
                                        className="border border-border-300 rounded-lg p-4 items-center justify-between"
                                    >
                                        <HStack space="xl" className="items-center">
                                            <Avatar>
                                                <AvatarImage
                                                    height={100}
                                                    width={100}
                                                    //@ts-ignore
                                                    source={item.bannerUri}
                                                />
                                            </Avatar>
                                            <VStack>
                                                <Text className="font-semibold text-typography-900 line-clamp-1">
                                                    {item.title}
                                                </Text>
                                                <Text className="line-clamp-1">{item.description}</Text>
                                            </VStack>
                                        </HStack>
                                        <Button size="xs">
                                            <ButtonText>Edit</ButtonText>
                                        </Button>
                                    </HStack>
                                </GridItem>
                            );
                        })}
                    </Grid>

                    <FinishSetUpMessage />

                    <Grid className="gap-5"
                        _extra={{
                            className: "gap-5",
                        }}
                    >
                        <GridItem
                            _extra={{
                                className: "col-span-12 sm:col-span-6 lg:col-span-4",
                            }}
                        >
                            <VStack
                                className="border border-border-300 rounded-lg px-4 py-6 items-center justify-between"
                                space="sm"
                            >
                                <Box className="self-start  w-full px-4">
                                    <Heading
                                        size="lg"
                                        className="font-roboto  text-typography-700"
                                    >
                                        Upcoming Tasks
                                    </Heading>
                                </Box>
                                <Divider />
                                {TasksCards.map((item, index) => {
                                    return (
                                        <HStack space="lg" key={index} className="w-full px-4 py-2">
                                            <Avatar className="bg-background-50 h-10 w-10">
                                                <Icon as={item.icon} />
                                            </Avatar>
                                            <VStack>
                                                <Text className="text-typography-900 font-roboto line-clamp-1">
                                                    {item.title}
                                                </Text>
                                                <Text className="text-sm font-roboto line-clamp-1">
                                                    {item.description}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </GridItem>
                        <GridItem
                            _extra={{
                                className: "col-span-12 sm:col-span-6 lg:col-span-4",
                            }}
                        >
                            <VStack
                                className="border border-border-300 rounded-lg px-4 py-6 items-center justify-between"
                                space="sm"
                            >
                                <Box className="self-start  w-full px-4">
                                    <Heading
                                        size="lg"
                                        className="font-roboto  text-typography-700"
                                    >
                                        Your Products
                                    </Heading>
                                </Box>
                                <Divider />
                                {ProductsCards.map((item, index) => {
                                    return (
                                        <HStack
                                            space="lg"
                                            key={index}
                                            className="w-full px-4 py-2 justify-between items-center"
                                        >
                                            <HStack space="xl" className="items-center">
                                                <Box
                                                    className={cn(
                                                        "rounded-full h-10 w-10 items-center justify-center",
                                                        { "bg-success-0": item.quantityPercent !== 0 },
                                                        { "bg-error-50": item.quantityPercent === 0 }
                                                    )}
                                                >
                                                    <Text
                                                        className={cn(
                                                            { "text-success-800": item.quantityPercent !== 0 },
                                                            { "text-error-700": item.quantityPercent === 0 }
                                                        )}
                                                    >
                                                        {item.quantityPercent}
                                                    </Text>
                                                </Box>
                                                <VStack>
                                                    <Text className="text-typography-900 font-roboto line-clamp-1">
                                                        {item.title}
                                                    </Text>
                                                    <Text className="text-sm font-roboto line-clamp-1">
                                                        {item.description}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <Button
                                                isDisabled={item.isDisabled}
                                                variant="outline"
                                                action="secondary"
                                                size="xs"
                                            >
                                                <ButtonText>Apply</ButtonText>
                                            </Button>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </GridItem>
                        <GridItem
                            _extra={{
                                className: "col-span-12 sm:col-span-6 lg:col-span-4",
                            }}
                        >
                            <VStack
                                className="border border-border-300  rounded-lg px-4 py-6 items-center justify-between"
                                space="sm"
                            >
                                <Box className="self-start  w-full px-4">
                                    <Heading
                                        size="lg"
                                        className="font-roboto  text-typography-700"
                                    >
                                        New colleagues
                                    </Heading>
                                </Box>
                                <Divider />
                                {HouseholdMembersCards.map((item, index) => {
                                    return (
                                        <HStack space="lg" key={index} className="w-full px-4 py-2">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    height={100}
                                                    width={100}
                                                    source={item.image}
                                                />
                                            </Avatar>
                                            <VStack>
                                                <Text className="text-typography-900 font-roboto line-clamp-1">
                                                    {item.title}
                                                </Text>
                                                <Text className="text-sm font-roboto line-clamp-1">
                                                    {item.access_level}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </GridItem>
                        <GridItem
                            _extra={{
                                className: "col-span-12 sm:col-span-6 lg:col-span-4",
                            }}
                        >
                            <VStack
                                className="border border-border-300 rounded-lg px-4 py-6 items-center justify-between"
                                space="sm"
                            >
                                <Box className="self-start w-full px-4">
                                    <Heading
                                        size="lg"
                                        className="font-roboto  text-typography-700"
                                    >
                                        New colleagues
                                    </Heading>
                                </Box>
                                <Divider />
                                {HouseholdMembersCards.map((item, index) => {
                                    return (
                                        <HStack space="lg" key={index} className="px-4 py-2 w-full">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    height={100}
                                                    width={100}
                                                    source={item.image}
                                                />
                                            </Avatar>
                                            <VStack>
                                                <Text className="text-typography-900 font-roboto line-clamp-1">
                                                    {item.title}
                                                </Text>
                                                <Text className="text-sm font-roboto line-clamp-1">
                                                    {item.access_level}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </GridItem>
                    </Grid>
                </VStack>
            </ScrollView>
        </Box>
    );
};
//#endregion main content

//#region default

const ProfileGridDashboard = () => {

    // const {data, error}

    return (
        <DashboardLayout
            title="Dashboard"
            isSidebarVisible={true}>
            <MainContent />
        </DashboardLayout>
    );
};

//#endregion
export default ProfileGridDashboard;
