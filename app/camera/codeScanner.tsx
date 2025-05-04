import React from "react";
import { Platform } from "react-native";
import {
    Camera,
    CameraDevice, useCameraDevice,
    CodeScanner,
    CodeType, useSkiaFrameProcessor,
    Code,
    useCodeScanner
} from "react-native-vision-camera"
import { useRootContext } from "@/app/_layout";
import { Redirect } from "expo-router";
import { Alert, View, Text, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Skia, BlendMode, add } from '@shopify/react-native-skia';
import { useCameraContext } from "@/components/contexts/CameraContext";
import { CalculateWithinOverlay } from "@/utils/barcode";
export const defaultCodeTypes = (defaultOverride?: CodeType[] | null) => {
    if (defaultOverride) return defaultOverride;

    const codes = ['code-128'
        , 'code-39'
        , 'code-93'
        , 'codabar'
        , 'ean-13'
        , 'ean-8'
        , 'itf'
        , 'itf-14'
        , 'upc-e'
        // , 'upc-a'
        , 'qr'
        , 'pdf-417'
        , 'aztec'
        , 'data-matrix'] as CodeType[];

    if (Platform.OS === 'android') {
        codes.push('upc-a');
    }
    return codes as CodeType[]
}


/**
 * * @description This hook is used to get the camera devices and permission status.
 * * @optional @param {FormatFilter[]} cameraFormatFilter - The format filter to use for the camera devices.
 * * It uses the `useCameraDevices` and `useCameraPermission` hooks from the `react-native-vision-camera` library.
 * * It returns the camera devices and permission status.
 * * @returns {Object} - The camera devices and permission status.
 * * @returns {Object} devices - The camera devices.
 * * @returns {Object} devices.back - The back camera device.
 * * @returns {Object} devices.front - The front camera device.
 */
// export const useVisionCamera = (cameraFormatFilter?: FormatFilter[]) => {
//     const devices = Camera.getAvailableCameraDevices() as CameraDevice[];
//     const permissions = Camera.getCameraPermissionStatus();
//     const device = useCameraDevice('back') as CameraDevice | undefined;
//     const format = useCameraFormat(device?.formats[0] ?? null) as FormatFilter | null;

//     return { devices, device, permission, format };
// }

export default function CodeScannerScreen() {
    const device = useCameraDevice('back') as CameraDevice | undefined;
    // const { cache } = useRootContext();
    const { addNewBarcode } = useCameraContext();
    const ScanOverlay = useSkiaFrameProcessor((frame) => {
        'worklet';
        frame.render();

        const width = frame.width;
        const height = frame.height;

        const overlayPaint = Skia.Paint();
        overlayPaint.setColor(Skia.Color('rgba(0, 0, 0, 0.5)'));

        const rectWidth = width * 0.8;
        const rectHeight = height * 0.5;
        const rectX = (width - rectWidth) / 2;
        const rectY = (height - rectHeight) / 2;

        // Draw dimmed background
        frame.drawRect(Skia.XYWHRect(0, 0, width, height), overlayPaint);

        // Clear the central rectangle area
        const clearPaint = Skia.Paint();
        clearPaint.setBlendMode(BlendMode.Clear);
        frame.drawRect(Skia.XYWHRect(rectX, rectY, rectWidth, rectHeight), clearPaint);
    }, []);


    if (!!!device) {
        return <Redirect href="/camera/no-devices" />;
    }
    const codeScanner = useCodeScanner({
        codeTypes: defaultCodeTypes(),
        onCodeScanned: (codes: Code[]) => {
            // if ([codes, typeof codes?.value === 'string'].every(Boolean)) {
            //     addNewBarcode(codes.value as string);
            // }
            if (!!!codes) return;
            const filteredCodes = codes.filter((code) => {

                if (Platform.OS === 'android') {
                    return CalculateWithinOverlay({ code })
                }
                return code.value && typeof code.value === 'string' && code.type in defaultCodeTypes();
            }) ?? []
            if (filteredCodes.length === 0) return;

            //add barcodes to stored context value
            filteredCodes.map((code) => {
                const barcode = code.value as string;
                addNewBarcode(barcode);
                Alert.alert("Scanned Barcode", barcode, [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ]);
            })
        }
    })

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Camera
                device={device}
                isActive={useIsFocused()}
                frameProcessor={ScanOverlay}
                style={{ flex: 1 }}
                codeScanner={codeScanner}
            />
        </SafeAreaView >
    );
}