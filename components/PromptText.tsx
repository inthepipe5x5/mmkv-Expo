import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { viewPort } from '@/constants/dimensions';
import { useColorScheme } from '@/hooks/useColorScheme';

export type promptType = "error" | "warning" | "success" | "info"
export type PromptTextProps = {
    promptText: string;
    promptType: string;
}

export const getBadgeColorByType = (badgeType: promptType): string => {
    switch (badgeType) {
        case "error":
            return "red";
        case "warning":
            return "yellow";
        case "success":
            return "green";
        case "info":
            return "blue";
        default:
            return "gray";
    }
};

const PromptText = ({ promptText, promptType }: PromptTextProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { height, width } = useWindowDimensions();
    let bgColor;
    switch (promptType) {
        case "error":
            bgColor = colors.input.false;
            break;
        case "warning":
            bgColor = colors.input.tertiary;
            break;
        case "success":
            bgColor = colors.input.success;
            break;
        default:
            bgColor = colors.input.neutral;
            break;
    }

    const styles = StyleSheet.create({
        promptContainer: {
            position: 'absolute',
            bottom: height * 0.4, //40% of screen height
            // left: width * 0.25, //half of current width
            minWidth: viewPort.devices.mobile.width * 0.2, //half of portrate mobile width
            maxWidth: viewPort.devices.mobile.width * 0.6, //half of portrate mobile width
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
        },
        promptText: {
            backgroundColor: bgColor,//'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: 10,
            borderRadius: 5,
        },
    });

    return (

        <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{promptText ?? "Align the object within the frame"}</Text>
        </View>
    )
}

export default PromptText;