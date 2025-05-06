import React, { Suspense } from "react";
import { Pexels } from "@/lib/pexels";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { Image as RNImage } from "react-native";

export type CuratedImageProps = {
    imageTitle?: string;
    imageSize?: "tiny" | "portrait" | "landscape" | "small" | "medium" | "large" | "large2x" | "original";
    imageHeight?: number;
}
/** Renders a "random" curated image from Pexels.
 * 
 * @param param0 
 * @returns 
 */
export default function CuratedImage({ imageTitle, imageSize = "original", imageHeight = 400 }: CuratedImageProps) {
    const [image, setImage] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const pc = new Pexels()

    React.useEffect(() => {
        const fetchImage = async () => {
            if (image === null) {
                const results = await pc.getCuratedPhotos(); // Replace with the correct method
                setImage(results.photos[0]?.src?.[imageSize] as string); // Example of setting the image
            }
            console.log("image", { image }, "set")
            return
        }
        fetchImage()
    }, [])

    return (
        // <Suspense fallback={<Text>Loading...</Text>}
        // > 
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {image !== null ? <Image
                source={{ uri: image }}
                style={{
                    width: "100%",
                    height: imageHeight,
                    borderRadius: 8,
                    marginBottom: 8,
                }}
                // contentFit="cover"
                placeholder={"blurhash"}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => console.error("Error loading image", { image })}
                cachePolicy={"memory-disk"}
            /> : null}
            {!!imageTitle ? (<Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>props?.imageTitle </Text>) : null}
        </View>
        // </Suspense>
    )
}