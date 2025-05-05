import React, { useCallback, useEffect } from "react";
import { Platform, ScrollView } from "react-native";
import {
    Camera,
    CameraDevice, useCameraDevice,
    CodeScanner,
    CodeType, useSkiaFrameProcessor,
    Code,
    useFrameProcessor,
    Frame,
    useCodeScanner,
    // useCodeScanner
} from "react-native-vision-camera"
import { useRootContext } from "@/app/_layout";
import { Redirect } from "expo-router";
import { Alert, View, Text, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Skia, BlendMode, add } from '@shopify/react-native-skia';
import { useCameraContext } from "@/components/contexts/CameraContext";
import { useBarcodeScanner } from "react-native-vision-camera-barcodes-scanner";
import { useRunOnJS } from "react-native-worklets-core";

import normalizeBarcode, { CalculateWithinOverlay } from "@/utils/barcode";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Barcode } from "react-native-vision-camera-barcodes-scanner/lib/typescript/src/types";

export const defaultCodeTypes = (defaultOverride?: CodeType[]) => {
    if (defaultOverride) return defaultOverride as CodeType[];

    const codes = [
        'code-128'
        , 'code-39'
        , 'code-93'
        , 'codabar'
        , 'ean-13'
        , 'ean-8'
        , 'itf'
        , 'upc-e'
        // , 'upc-a'
        , 'qr'
        , 'pdf-417'
        , 'aztec'
        , 'data-matrix'] as CodeType[];

    if (Platform.OS === 'android') {
        codes.push('upc-a');
    }

    if (Platform.OS === 'ios') {
        codes.push('itf-14');
    }
    //for debugging purposes
    // console.log("defaultCodeTypes", { codes });
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
    const { addNewBarcode, scannedBarcodes } = useCameraContext();
    const resultSheetRef = React.useRef<TrueSheet>(null);
    const scrollRef = React.useRef<ScrollView>(null);
    const [openSheet, setOpenSheet] = React.useState<boolean>(false);

    useEffect(() => {
        const handleOpenSheet = async () => {
            if (resultSheetRef.current !== null && openSheet) {
                await resultSheetRef.current?.resize(1);
            }
        }
        handleOpenSheet();

    }, [])
    // const ScanOverlay = useSkiaFrameProcessor((frame) => {
    //     'worklet';
    //     frame.render();

    //     const width = frame.width;
    //     const height = frame.height;

    //     const overlayPaint = Skia.Paint();
    //     overlayPaint.setColor(Skia.Color('rgba(0, 0, 0, 0.5)'));

    //     const rectWidth = width * 0.8;
    //     const rectHeight = height * 0.5;
    //     const rectX = (width - rectWidth) / 2;
    //     const rectY = (height - rectHeight) / 2;

    //     // Draw dimmed background
    //     frame.drawRect(Skia.XYWHRect(0, 0, width, height), overlayPaint);

    //     // Clear the central rectangle area
    //     const clearPaint = Skia.Paint();
    //     clearPaint.setBlendMode(BlendMode.Clear);
    //     frame.drawRect(Skia.XYWHRect(rectX, rectY, rectWidth, rectHeight), clearPaint);
    // }, []);
    // const parseFrame = useCallback((frame: Frame) => {

    //     const codes = scanBarcodes(frame) as Barcode[];
    //     if (codes.length === 0) return;
    //     //do nothing if the code is already scanned

    // }, [])

    if (!!!device) {
        return <Redirect href="/camera/no-devices" />;
    }
    const codeScanner = useCodeScanner({
        codeTypes: defaultCodeTypes(),
        onCodeScanned: (codes: Code[]) => {
            //do nothing if the code is already scanned 
            if (codes.length === 0 || !!codes[0]?.value && normalizeBarcode(codes[0]?.value) in scannedBarcodes) return;
            console.log("Scanned codes", codes.map((code) => JSON.stringify(code, null, 4)));

            if (typeof codes[0]?.value === 'string' && !(normalizeBarcode(codes[0]?.value) in scannedBarcodes))
                addNewBarcode(codes[0]?.value as string);
        }
    })

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Camera
                device={device}
                isActive={useIsFocused()}
                // frameProcessor={ScanOverlay}
                style={{ flex: 1 }}
                codeScanner={codeScanner}
                // frameProcessor={barcodeFrameProcessor}
                photoQualityBalance="speed"
                format={device.formats[0]}
                
            />
            <TrueSheet
                name="codeScannerResultSheet"
                ref={resultSheetRef}
                style={{ backgroundColor: 'white', padding: 20, minHeight: '100%' }}
                sizes={['20%', '50%', '90%']}
                initialIndex={0}
                initialIndexAnimated={Platform.OS === 'ios'}
                dimmedIndex={1}
                dismissible={false}
                onDismiss={() => setOpenSheet(false)}
                edgeToEdge={Platform.OS === 'android'}

            >
                <ScrollView nestedScrollEnabled ref={scrollRef}
                    contentContainerStyle={{
                        // justifyContent: 'center',
                        // alignItems: 'center',
                        // backgroundColor: "black"
                        height: '100%',
                    }}>
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Scanned Barcodes</Text>
                        {Object.keys(scannedBarcodes).length > 0 ? (
                            Object.keys(scannedBarcodes).map((barcode, index) => (
                                <Text key={barcode} style={{ marginVertical: 5 }}>Barcode #{index + 1}{barcode}</Text>
                            ))
                        ) : (
                            <Text>No barcodes scanned yet.</Text>
                        )}
                    </View>
                </ScrollView>
            </TrueSheet>
        </SafeAreaView >
    );
}