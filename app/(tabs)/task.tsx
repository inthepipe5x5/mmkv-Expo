import React from "react";
import { StyleSheet, ImageBackground, ImageBackgroundProps, Button } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useStorageContext }  from "@/components/contexts/StorageProvider";
import { fakeTask, fakeProduct } from "@/lib/__MOCK__/productTasks";
import { Collapsible } from "@/components/Collapsible";

const customImageBg = (props: Partial<ImageBackgroundProps>) => {
    return <ImageBackground {...props} style={styles.header} resizeMode="cover" />;
};


const HEADER_HEIGHT = 250;

export default function TaskScreen() {
    const { cache } = useStorageContext();
    const [currentTask, setCurrentTask] = React.useState<null | typeof fakeTask>(null);
    const [currentProduct, setCurrentProduct] = React.useState<null | typeof fakeProduct>(null);

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={customImageBg({
                source: require("@/assets/images/estee-janssens-aQfhbxailCs-unsplash.jpg"),
                style: styles.header,
            })}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">{fakeTask?.task_name ?? "Task"}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="subtitle">Task Due Date: {new Date(fakeTask.due_date).toLocaleDateString()}</ThemedText>
            </ThemedView>
            <Collapsible title="Task Details">
                <ThemedText>Task ID: {fakeTask.id}</ThemedText>
                <ThemedText>Task Name: {fakeTask.task_name}</ThemedText>
                <ThemedText>Task Description: {fakeTask.description}</ThemedText>
                <ThemedText>Task Created At: {new Date(fakeTask.created_dt).toLocaleDateString()}</ThemedText>
                <ThemedText>Status: {fakeTask.completion_status}</ThemedText>
                <ThemedText>Task Updated At: {new Date(fakeTask.updated_dt).toLocaleDateString()}</ThemedText>
                <ThemedText>Task Assigned To: {fakeTask.assigned_to.name}</ThemedText>
            </Collapsible>

            <Collapsible title="Related Product">
                <ThemedText>Product ID: {fakeProduct.id}</ThemedText>
                <ThemedText>Product Name: {fakeProduct.product_name}</ThemedText>
                <ThemedText>Category: {fakeProduct.product_category}</ThemedText>
                <ThemedText>Product Description: {fakeProduct.description}</ThemedText>
                <ThemedText>Product Status: {fakeProduct.current_quantity}</ThemedText>
                <ThemedText>Product last update at: {fakeProduct.updated_dt}</ThemedText>
            </Collapsible>

            <ThemedText>Cache value: {cache.getItem("task")}</ThemedText>
            <Button title="Save"
                onPress={() => {
                    cache.setItem("task", JSON.stringify(fakeTask));
                    console.log("Cache set:", { task: fakeTask });
                }
                } />
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        padding: 16,
        backgroundColor: "#A1CEDC",
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