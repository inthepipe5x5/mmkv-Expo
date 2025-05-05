import React, { Suspense } from "react";
import { Pexels } from "@/lib/pexels";
import { Image } from "expo-image";
import { Text } from "react-native";

export type CuratedImageProps = {
    imageTitle?: string;
    imageSize: "tiny" | "portrait" | "landscape" | "small" | "medium" | "large" | "large2x" | "original";
    imageHeight: number;
}
/** Renders a "random" curated image from Pexels.
 * 
 * @param param0 
 * @returns 
 */
export default function CuratedImage({ imageTitle, imageSize = "original", imageHeight = 200 }: CuratedImageProps) {
    const [image, setImage] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const pc = new Pexels()

    React.useEffect(() => {
        const fetchImage = async () => {
            if (image === null) {
                const image = await pc.getCuratedPhotos(); // Replace with the correct method
                setImage(image.photos[0]?.src?.[imageSize] as string); // Example of setting the image
            }
            return
        }
        fetchImage()
        console.log("image", { image }, "set")
    }, [])

    return (
        <Suspense fallback={<Text>Loading...</Text>}
        > <Image
                source={{ uri: image }}
                style={{
                    width: "100%",
                    height: imageHeight,
                    borderRadius: 8,
                    marginBottom: 8,
                }}
                contentFit="cover"
                placeholder={imageTitle ?? "blurhash"}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => console.error("Error loading image", { image })}
                cachePolicy={"memory-disk"}
            />
            {!!imageTitle ? (<Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>props?.imageTitle </Text>) : null}
        </Suspense>
    )
}