import { Image } from "expo-image";
import { Card } from "@/components/ui/card";
import { ThemedText } from "../ThemedText";
import { Database } from '@/lib/supabase/dbTypes';
import { useMemo } from "react";
import { Collapsible } from "../Collapsible";
import { Pressable } from "../ui/pressable";
import { StyleSheet, Appearance } from "react-native";
import { dark, light } from "@/constants/Colors";

export type ProductCardProps = {
    product: Database["public"]["Tables"]["products"]["Row"];
    onPress: (arg?: Database["public"]["Tables"]["products"]["Row"]) => void;
    withDescription?: boolean;
};

export default function ProductCard({ product, onPress, withDescription = false }: ProductCardProps) {
    return (
        <Pressable
            onPress={() => onPress(product)}
        >
            <Card
                size="lg"
                variant="elevated"
                style={styles.card}
            >
                <Image
                    source={{ uri: product?.photo_url }}
                    style={styles.image}
                    contentFit="cover"
                    transition={1000}
                    placeholder={require("@/assets/images/mike-kenneally-TD4DBagg2wE-unsplash.png")}
                />
                <ThemedText type="title" style={styles.title}>
                    {product.product_name}
                </ThemedText>
                {withDescription ? <Collapsible title="description">
                    <ThemedText type="subtitle" style={styles.description}>
                        {product.description ?? "No description available"}
                    </ThemedText>
                </Collapsible>
                    : null}
            </Card>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        margin: 8,
    },
    image: {
        width: "100%",
        maxHeight: 200,
        flexGrow: 1,
        flexShrink: 1,
    },
    title: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "bold",
        color: Appearance.getColorScheme() !== "dark" ? dark.primary : light.primary,
        textAlign: "left",
        textTransform: "capitalize",
        justifyContent: "flex-start"
    },
    description: {
        marginTop: 4,
        fontSize: 16,
        color: Appearance.getColorScheme() !== "dark" ? dark.secondary : light.secondary,
        textAlign: "left",
        justifyContent: "flex-start",
    },
    collapsible: {
        marginTop: 8,
        padding: 8,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "f2f2f2" : "#f0f0f0",
        borderRadius: 8,
    },
});