import React, { useCallback } from "react";
import { StyleSheet, ImageBackground, ImageBackgroundProps, Appearance } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useStorageContext } from "@/components/contexts/StorageProvider";
import { fakeProduct, fakeTask } from "@/lib/__MOCK__/productTasks";
import { Collapsible } from "@/components/Collapsible";
import { HEADER_HEIGHT } from "@/constants/dimensions";
import { Image } from "expo-image";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { CalendarClockIcon, Edit } from "lucide-react-native";
import { light } from "@/constants/Colors";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeText } from "@/components/ui/badge";
import { draft_status } from "@/lib/supabase/enums";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { produce } from "immer";
import { Card } from "@/components/ui/card";

const customImageBg = (props: Partial<ImageBackgroundProps>) => {
    return <ImageBackground {...props} style={styles.header} resizeMode="cover" />;
};


export default function TaskScreen() {
    const { cache } = useStorageContext();
    const [currentTask, setCurrentTask] = React.useState<null | typeof fakeTask>(null);
    const [currentProduct, setCurrentProduct] = React.useState<null | typeof fakeProduct>(null);
    const [isDatePickerVisible, setDatePickerVisibility] = React.useState<boolean>(false);
    const [isUpdated, setIsUpdated] = React.useState<boolean>(false);

    const fallback = require("@/assets/images/tasks/list.png")

    const TaskDate = React.useMemo(() => {
        const fallBackDate = () => (<ThemedText style={styles.dateText}>"Created" + new Date(currentTask?.created_dt ?? new Date()).toLocaleDateString()
        </ThemedText>
        )
        const updatedDate = () => (<ThemedText
            type="subtitle"
            style={styles.updatedDateText}
        >
            "Updated" + new Date(currentTask?.updated_dt ?? new Date()).toLocaleDateString();
        </ThemedText>)

        return !!currentTask?.updated_dt &&
            new Date(currentTask.created_dt as string) < new Date(currentTask?.updated_dt ?? new Date()) ?
            updatedDate() :
            fallBackDate();
    }, [currentTask]);

    const updateDueDate = useCallback((date: Date) => {
        setCurrentTask((prev) => produce(prev, (draft) => {
            if (draft) {
                draft.due_date = date.toISOString();
            }
            setIsUpdated(true);
        }));
        setDatePickerVisibility(false);
    }
        , []);

    return (
        <ParallaxScrollView
            // headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={
                // customImageBg({
                //     source: currentProduct?.photo_url ? { uri: currentProduct?.photo_url } : fallback,
                //     style: styles.header,
                // })
                <Image
                    source={currentProduct?.photo_url ? { uri: currentProduct?.photo_url } : fallback}
                    style={styles.header}
                    contentFit="cover"
                    transition={1000}
                    placeholder={require("@/assets/images/tasks/list.png")}
                    placeholderContentFit="cover"
                />
            }
        >

            <ThemedView style={styles.titleContainer}>
                <Card
                    variant="outline"
                >

                    <HStack>
                        <ThemedText
                            type="title"
                            style={{ marginRight: 5 }}
                        >
                            {currentTask?.task_name ?? "Task"}</ThemedText>
                        <Badge
                            className="ml-5"
                            action="info"
                            size="sm"
                            variant="solid">
                            <BadgeText>
                                {currentTask?.draft_status ?? "Draft"}
                            </BadgeText>
                        </Badge>

                        <Badge
                            className="ml-5"
                            action="error"
                            size="sm"
                            variant="solid">
                            <BadgeText>
                                {currentTask?.completion_status}
                            </BadgeText>
                        </Badge>
                    </HStack>
                </Card>
            </ThemedView>
            <ThemedView
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 16,
                    backgroundColor: light.accent,
                    alignItems: "center",
                }}>
                {!!currentTask?.due_date ? (
                    <ThemedText type="subtitle">Due: {new Date(currentTask.due_date).toLocaleDateString()}</ThemedText>) : (
                    <ThemedText type="subtitle" style={{
                        fontStyle: "italic",
                        color: "red",
                        fontWeight: "bold",
                        fontSize: 18,
                    }}>No due date</ThemedText>
                )}
                <Fab
                    size="sm"
                    android_ripple={{ color: light.accent }}
                    placement="bottom right"
                >
                    <FabIcon
                        as={CalendarClockIcon}
                        color="white"
                        size={'md'}
                    />
                    <FabLabel>Reschedule</FabLabel>
                </Fab>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={updateDueDate}
                    onCancel={() => setDatePickerVisibility(false)}
                    date={new Date(currentTask?.due_date ?? new Date())}
                    isDarkModeEnabled={Appearance.getColorScheme() === "dark"}
                />
            </ThemedView>
            <Collapsible
                title="Task Details"
                startOpen={true}
            >
                {!!currentTask?.id ? <ThemedText>Task ID: {currentTask.id}</ThemedText> : null}
                <ThemedText>Description: {currentTask?.description ?? "No description available"}</ThemedText>
                {/* 
                <ThemedText>Task Assigned To: {currentTask.assigned_to.name}</ThemedText>
                <ThemedText>Repeating every {currentTask.recurrence_interval}</ThemedText> */}
            </Collapsible>

            {!!currentProduct ? (<Collapsible
                title="Related Product">
                <ThemedText>Product ID: {currentProduct.id}</ThemedText>
                <ThemedText>Product Name: {currentProduct.product_name}</ThemedText>
                <ThemedText>Category: {currentProduct.product_category}</ThemedText>
                <ThemedText>Product Description: {currentProduct.description}</ThemedText>
                <ThemedText>Product Quantity: {currentProduct.current_quantity} / {currentProduct.max_quantity} {currentProduct.quantity_unit}</ThemedText>
                <ThemedText>Status: {currentProduct.current_quantity_status}</ThemedText>
                <ThemedText>Product updated: {new Date(currentProduct.updated_dt).toLocaleDateString()}</ThemedText>
            </Collapsible>) :
                <Button
                    action="secondary"
                    onPress={() => {
                        cache.setItem("task", JSON.stringify(currentTask));
                        console.log("Cache set:", { task: currentTask });
                    }
                    }
                    android_ripple={{ color: light.accent }}
                >
                    <ButtonText>
                        Assign a product
                    </ButtonText>
                </Button>
            }

            <Button
                action="positive"
                onPress={() => {
                    cache.setItem("task", JSON.stringify(currentTask));
                    console.log("Cache set:", { task: currentTask });
                }
                }
                android_ripple={{ color: light.accent }}
            >
                <ButtonText>
                    Complete
                </ButtonText>
            </Button>
            <Fab
                className="bg-error-900"
                size="sm"
                android_ripple={{ color: light.accent }}
                placement="top left"
            >
                <FabIcon
                    as={Edit}
                    color="white"
                    size={'md'}
                />
                <FabLabel>Edit</FabLabel>
            </Fab>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    dateText: {
        fontSize: 12,
        marginTop: 5,
        fontStyle: "italic",
    },
    updatedDateText: {
        color: light.accent,
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 5,
        fontStyle: "italic",
    },
    titleContainer: {
        padding: 16,
        // backgroundColor: "#A1CEDC",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 5,
    },
    header: {
        height: HEADER_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "#e4fff4",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
});