import React, { Suspense } from "react";
import { Pexels } from "@/lib/pexels";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PexelsResponse } from "@/lib/pexels/types";

export type CuratedImageProps = {
    imageTitle?: string;
    imageSize?: "tiny" | "portrait" | "landscape" | "small" | "medium" | "large" | "large2x" | "original"; //key in src object
    imageHeight?: number;
}
/** Renders a "random" curated image from Pexels.
 * 
 * @param param0 
 * @returns 
 */
export default function CuratedImage({ imageTitle,
    imageSize = "original",
    imageHeight = 400 }: CuratedImageProps) {
    const [image, setImage] = React.useState<string | null>(null);
    const pc = new Pexels()

    const { data, isLoading, error } = useQuery({
        queryKey: ['pexelsCuratedImages', { page: pc.currentQuery.page }],
        queryFn: async () => {
            const results = await pc.getCuratedPhotos() as PexelsResponse; // Replace with the correct method
            const imageURL = pc.getSafeCuratedPhotos(results, imageSize, false) as string | null//results.photos[0]?.src?.[imageSize] as string | null// Return the image URL
            setImage(imageURL);
            return imageURL;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Skeleton />
            </View>
        )
    }

    if (error) {
        console.error("Error fetching curated image:", error);
        setImage(require("@/assets/images/feedback/page-eaten.png"));
    }

    return (
        // <Suspense fallback={<Text>Loading...</Text>}
        // > 
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image
                source={{ uri: image ?? data }}
                style={{
                    width: "100%",
                    height: imageHeight,
                    borderRadius: 8,
                    marginBottom: 8,
                }}
                // contentFit="cover"
                placeholder={require("@/assets/images/feedback/page-eaten.png")}
                cachePolicy={"memory-disk"}
            />
            {!!imageTitle ? (<Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>props?.imageTitle </Text>) : null}
        </View>
        // </Suspense>
    )
}