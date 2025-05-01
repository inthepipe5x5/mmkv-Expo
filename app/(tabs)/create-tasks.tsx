import React from "react";
import { StyleSheet, ImageBackground, ImageBackgroundProps, Button, Pressable, KeyboardAvoidingView, TextInput } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRootContext } from "@/app/_layout";
import { fakeTask, fakeProduct } from "@/lib/__MOCK__/productTasks";
import { Collapsible } from "@/components/Collapsible";
import DateTimePickerModal from "react-native-modal-datetime-picker";


type task = typeof fakeTask;
type product = typeof fakeProduct;

const HEADER_HEIGHT = 250;

const genRandomId = () => {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}
const defaultValues = { ...fakeTask, id: genRandomId(), created_dt: new Date().toISOString(), updated_dt: new Date().toISOString() }

const CreateTask = (initialFormValues: Partial<task> = defaultValues) => {
    const [formValues, setFormValues] = React.useState<Partial<task>>(initialFormValues);
    const [datePickerKey, setDatePickerKey] = React.useState<null | keyof task>(null);
    const { cache } = useRootContext();

    const handleDateConfirmation = (date: Date) => {
        if (!!datePickerKey) {
            setFormValues({ ...formValues, [datePickerKey]: date.toISOString() });
        }
        setDatePickerKey(null);
    };

    const DatePicker = () => <DateTimePickerModal
        isVisible={datePickerKey !== null}
        mode="date"
        onConfirm={handleDateConfirmation}
        onCancel={() => setDatePickerKey(null)}
    />

    const SaveButton = () => <Button title="Save"
        onPress={() => {
            cache.setItem("task", JSON.stringify(formValues));
            console.log("Cache set:", { task: formValues });
        }
        }
    />

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={
                <ImageBackground
                    source={require("@/assets/images/partial-react-logo.png")}
                    resizeMethod="auto" />
            }
        >
            <DatePicker />
            <KeyboardAvoidingView style={styles.titleContainer}>
                <Pressable>
                    {/* <ThemedText type="title">{formValues?.task_name ?? "Remind me"}</ThemedText> */}
                    <TextInput
                        placeholder="Task Name"
                        value={formValues.task_name}
                        onChangeText={(text) => setFormValues({ ...formValues, task_name: text })}
                        style={{ backgroundColor: "#fff", padding: 10, borderRadius: 5, marginTop: 10 }}
                    />
                </Pressable>
            </KeyboardAvoidingView>
            <ThemedView style={styles.titleContainer}>
                <Pressable onPress={() => setDatePickerKey("due_date")} android_ripple={{ color: "#A1CEDC" }}>
                    <ThemedText type="subtitle">Task Due Date: {formValues.due_date ? new Date(formValues.due_date).toLocaleDateString() : "No due date set"}</ThemedText>
                </Pressable>
            </ThemedView>
            <ThemedView style={styles.textContainer}>
                <ThemedText style={styles.text}>
                    Describe your task here:
                </ThemedText>
                <TextInput
                    placeholder="Task Description"
                    value={formValues.description}
                    onChangeText={(text) => setFormValues({ ...formValues, description: text })}
                    style={{ backgroundColor: "#fff", padding: 10, borderRadius: 5, marginTop: 10 }}
                />
            </ThemedView>
            <SaveButton />
        </ParallaxScrollView>
    )

}

export default CreateTask;

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
    text: {
        fontSize: 16,
        color: "#000",
    },
    textContainer: {
        padding: 16,
        backgroundColor: "#A1CEDC",
    },
    saveButton: {
        backgroundColor: "#e4fff4",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
});