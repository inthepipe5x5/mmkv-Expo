import { Image, ImageContentFit } from 'expo-image';
import { StyleSheet, View, Appearance } from 'react-native';

/** Renders an SVG image from a given URL using Expo-Image library
 * 
 */

export default function SVGImage({ uri, style, options = {
    // tintColor: undefined,
    contentFit: "cover",
} }: {
    uri: string; style?: any; options?: {
        tintColor?: string;
        constainerStyle?: Object;
        imageStyle?: Object;
        contentFit?: ImageContentFit;
    }
}) {
    const colorScheme = Appearance.getColorScheme() ?? "light";

    const styles = StyleSheet.create({
        container: options?.constainerStyle ?? {
            flex: 1,
            // backgroundColor: colorScheme === "dark" ? "#f6f6f6" : "#535252",
            alignItems: 'center',
            justifyContent: 'center',
        },
        image: options?.imageStyle ?? {
            flex: 1,
            width: '100%',
            // backgroundColor: colorScheme === "dark" ? "#f6f6f6" : "#535252", //gluestack-ui default background tokens
        },
    });

    return (
        <View style={[styles.container, style]}>
            <Image
                source={{ uri }}
                contentFit={options?.contentFit as ImageContentFit ?? "cover"}
                cachePolicy={"none"}
                alt={"SVG Image"}
                style={styles.image}
                tintColor={!!options?.tintColor ? options?.tintColor : undefined}
            />
        </View>
    );
}


