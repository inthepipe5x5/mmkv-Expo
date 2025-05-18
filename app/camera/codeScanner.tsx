import React, { useCallback, useEffect, useRef } from "react";
import { Platform, ScrollView, useWindowDimensions } from "react-native";
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
import { useStorageContext } from "@/components/contexts/StorageProvider";
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
import PromptText, { PromptTextProps } from "@/components/PromptText";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";
import axios, { AxiosInstance } from "axios";
import { OFFProduct } from "@/lib/__MOCK__/productTasks";
import { set } from "react-hook-form";

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
const DEBOUNCE_TIME = 3000 //3 seconds to handle the "constant" messy barcodes being scanned when it's in frame

export default function CodeScannerScreen() {
    const device = useCameraDevice('back') as CameraDevice | undefined;
    const { height, width } = useWindowDimensions();
    // const { cache } = useStorageContext();
    const { addNewBarcode, scannedBarcodes } = useCameraContext();
    const resultSheetRef = React.useRef<TrueSheet>(null);
    const scrollRef = React.useRef<ScrollView>(null);
    const [cameraInitialized, setCameraInitialized] = React.useState<boolean>(false);
    const [scanning, setScanning] = React.useState<boolean>(false); //flag to 
    const [openSheet, setOpenSheet] = React.useState<boolean>(false);
    const [messyBarcodes, setMessyBarcodes] = React.useState<{ [key: string]: number }>({});
    const [likelyBarcodes, setLikelyBarcodes] = React.useState<Set<string>>(new Set<string>());
    const [invalidBarcodes, setInvalidBarcodes] = React.useState<Set<string>>(new Set<string>());
    const [prompt, setPrompt] = React.useState<PromptTextProps | null>(null);
    const toast = useToast();
    //#region effects
    useEffect(() => {
        const handleOpenSheet = async () => {
            if (resultSheetRef.current !== null && openSheet) {
                await resultSheetRef.current?.resize(1);
            }
        }
        handleOpenSheet();

    }, []);

    const handleScannedMessyBarcodes = React.useCallback(({ value }: Code) => {
        if (typeof value !== 'string') {
            setPrompt({
                promptText: "Invalid barcode value"
                , promptType: "error"
            })
            return
        };
        const normalizedValue = normalizeBarcode(value);
        setMessyBarcodes(prev => ({
            ...prev,
            [normalizedValue]: (prev[normalizedValue] || 0) + 1
        }));
    }, [])
    //find the most frequent barcode in the messyBarcodes object and set it to likelyBarcodes
    useEffect(() => {
        //if the camera is not initialized, do nothing
        if (!!!cameraInitialized) return;

        if (Object.keys(messyBarcodes).length === 0) {
            setPrompt({
                promptText: "No barcodes scanned detected yet. Try again.",
                promptType: "info"
            });
            return;
        };

        if (Object.keys(messyBarcodes).length > 0) {
            setPrompt({
                promptText: "Scanning...",
                promptType: "info"
            });
            //handle the messy barcodes being actively scanned
            const debouncedScan = setTimeout(() => {
                const mostFrequentBarcode = Object.keys(messyBarcodes)
                    //ensure the barcode is not in the invalid barcodes set
                    .filter((barcode: string) => !invalidBarcodes.has(barcode))
                    //sort the barcodes by their frequency
                    .reduce((a, b) => messyBarcodes[a] > messyBarcodes[b] ? a : b);

                const barcodeCount = messyBarcodes[mostFrequentBarcode] as number;

                if (!!!barcodeCount || barcodeCount < 5) {
                    setPrompt({
                        promptText: `Try moving closer to the barcode.`,
                        promptType: "info"
                    })
                    return;
                }

                if (barcodeCount >= 5) { // Ensure the barcode is scanned at least 5 times
                    console.log("mostFrequentBarcode", { mostFrequentBarcode, barcodeCount });
                    // Update state and cache the result
                    likelyBarcodes.add(mostFrequentBarcode);
                    setLikelyBarcodes(likelyBarcodes);
                    addNewBarcode(mostFrequentBarcode);
                }
                // Clear the messy barcodes
                setMessyBarcodes({});
                setPrompt({
                    promptText: `Scanned new barcode: ${mostFrequentBarcode} (${barcodeCount} times)`,
                    promptType: "success"
                });
            }, DEBOUNCE_TIME);

            return () => {
                clearTimeout(debouncedScan)
                setMessyBarcodes({});
                setPrompt(null);
            };
        }

    }, [messyBarcodes])

    //clean up prompts
    useEffect(() => {
        if (prompt === null) return;
        // const timeout = setTimeout(() => {
        //     setPrompt(null);
        // }, DEBOUNCE_TIME);
        // return () => clearTimeout(timeout);
        toast.show({
            duration: 2000,
            placement: "top",
            render: () => {
                return (<Toast
                    variant="solid"
                    action={prompt.promptType}
                >
                    <ToastTitle>{prompt.promptText}</ToastTitle>
                </Toast>)
            }
        })

    }, [prompt])



    const { data, isLoading, error } = useQuery({
        queryKey: ['barcodeLookup', { barcodes: Array.from(likelyBarcodes) }],
        queryFn: async () => {
            // offAxios.current = axios.create({
            //     baseURL: `${process.ENV.EXPO_PUBLIC_OPEN_FOOD_FACTS_API}${process.ENV.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_VERSION}`
            //     headers: {

            //     }
            // })
            if (likelyBarcodes.size === 0) return;
            const results = await Promise.all([
                supabase.from("products")
                    .select()
                    .in("barcode", Array.from(likelyBarcodes)),
                setTimeout(() => {
                    return OFFProduct
                }, 1000)
            ]);
            console.log("results", JSON.stringify(results, null, 4));
            //handle supabase error
            if (results[0].error) {
                setPrompt({
                    promptText: "No matching product found in the database",
                    promptType: "error"
                });
                return;
            }
            //handle empty result
            if (!results.every(Boolean) || results[0].data.length === 0) {
                setPrompt({
                    promptText: "No matching product found in the database",
                    promptType: "error"
                });
                //update invalid barcodes
                Array.from(likelyBarcodes).forEach(barcode => invalidBarcodes.add(barcode));
                setInvalidBarcodes(invalidBarcodes);
            }
            //reset barcodes
            setLikelyBarcodes(new Set<string>());
            setMessyBarcodes({});
            return;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        enabled: (likelyBarcodes.size > 0) === true
    })

    //#endregion effects
    //#region skia frame 
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
    // 
    // const parseFrame = useCallback((frame: Frame) => {

    //     const codes = scanBarcodes(frame) as Barcode[];
    //     if (codes.length === 0) return;
    //     //do nothing if the code is already scanned

    // }, [])
    //#endregion skia frame 

    if (!!!device) {
        return <Redirect href="/camera/no-devices" />;
    }
    //#region Scanner
    const codeScanner = useCodeScanner({
        codeTypes: defaultCodeTypes(),
        onCodeScanned: (codes: Code[]) => {
            if (codes.length === 0) return;
            codes.forEach((code) => {
                //handle a unique barcode with a truthy value
                if (typeof code.value === 'string'
                    && !(likelyBarcodes.has(code.value))
                    && !invalidBarcodes.has(code.value)) {
                    handleScannedMessyBarcodes(code)
                };
            })
        }
    })
    //#endregion Scanner
    //#region prompts

    //#endregion prompts


    //#region jsx
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Camera
                device={device}
                isActive={useIsFocused() && !isLoading}
                // frameProcessor={ScanOverlay}
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
                onInitialized={() => setCameraInitialized(true)}
                codeScanner={codeScanner}
                photoQualityBalance="speed"
                format={device.formats[0]}
            />
            <View
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: "white",
                    borderWidth: 10,
                    width: '100%',
                    height: Platform.OS === 'android' ? Math.floor(height * 0.3) : 200,
                    position: 'absolute',
                    top: height * 0.5 - (Platform.OS === 'android' ? Math.floor(height * 0.3) : 200) / 2,
                    left: width * 0.5 - width * 0.8 / 2,
                }}
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
                        {
                            prompt !== null ? <PromptText {...prompt} /> : null
                        }
                    </View>
                </ScrollView>
            </TrueSheet>
        </SafeAreaView >
    );
}