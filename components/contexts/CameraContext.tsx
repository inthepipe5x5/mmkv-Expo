import React, { useMemo, useCallback, useContext, createContext, useEffect } from "react";
import { Camera, CameraDevice, CameraPermissionStatus, useCameraPermission } from "react-native-vision-camera";
import { useRootContext } from "@/app/_layout";
import { useIsFocused } from "@react-navigation/native";
import { Alert, Linking } from "react-native";
import normalizeBarcode from "@/utils/barcode";

export type scannedBarcodeType = {
    [key: string]: string;
}
type CameraContextValue = {
    cameraPermission: boolean | null;
    syncPermissionStatus: (permission: CameraPermissionStatus) => void;
    activeCamera?: boolean;
    scannedBarcodes: scannedBarcodeType
    setScannedBarcodes: (scannedBarcode: string) => void;
    addNewBarcode: (barcode: string) => void;
}
const CameraContext = createContext<CameraContextValue | null>(null);
//#region hook 
// //Create a custom hook to use the CameraContext
export const useCameraContext = () => {
    const context = useContext(CameraContext);
    if (!context) {
        throw new Error("useCameraContext must be used within a CameraProvider");
    }
    return context;
};

//#endregion hook
//#region provider

/** Provider for the CameraContext to capture meta data and permission status.
 * 
 * @param param0 
 * @returns 
 */
export const CameraProvider = ({ children }: { children: React.ReactNode }) => {
    const { cache } = useRootContext();
    const isFocused = useIsFocused();
    const devices = Camera.getAvailableCameraDevices() as CameraDevice[] | null;
    const { hasPermission } = useCameraPermission();
    const [cameraPermission, setCameraPermission] = React.useState<boolean | null>(hasPermission);
    const [scannedBarcodes, setScannedBarcodes] = React.useState<scannedBarcodeType>({});
    //#region methods
    const syncPermissionStatus = React.useCallback((permission: CameraPermissionStatus) => {
        const cachedPermission = cache.getItem("cameraPermission") as CameraPermissionStatus | null;
        console.log("Cached permission", cachedPermission);

        // //do nothing when the permission is same as the cached permission
        if (cachedPermission === permission) return;
        if (hasPermission === cameraPermission) return;

        //sync with cache
        setCameraPermission(hasPermission);
        cache.setItem("cameraPermission", permission);

        console.log("Camera permission updated and cached.", JSON.stringify({ hasPermission, permission }, null, 2));
    }, [])
    //determine if the camera is active or not eg. for rendering bottom sheet content
    const activeCamera = React.useMemo(() => {
        return [cameraPermission, isFocused, (devices ?? [])?.length > 0].every(Boolean)
    }, [devices, cameraPermission, isFocused]);

    const addNewBarcode = useCallback((barcode: string) => {
        const normalizedBarcode = normalizeBarcode(barcode);
        const timestamp = new Date().toUTCString();
        //do nothing when the barcode is already scanned
        if (normalizedBarcode in scannedBarcodes) return;
        //set the scanned barcode to the state
        setScannedBarcodes((prevState) => ({
            ...prevState,
            [normalizedBarcode]: timestamp
        }));
        //sync with cache
        cache.setItem("scannedBarcodes", JSON.stringify(scannedBarcodes));
    }, []);
    //#endregion methods
    //#region sync effect 
    useEffect(() => {
        //sync the camera permission status with the cache
        const cameraPermissionStatus = Camera.getCameraPermissionStatus() as CameraPermissionStatus;
        syncPermissionStatus(cameraPermissionStatus);

        if (cameraPermissionStatus === "denied") {
            Alert.alert(
                "Permission Denied",
                "Camera permission denied which is needed for the core app functionality to work. Please enable this manually in the settings.",
                [
                    {
                        text: "Open Settings",
                        onPress: () => Linking.openSettings(),
                        style: "default",
                    },
                    {
                        text: "Cancel",
                        style: "destructive",
                        onPress: () => { },
                    }
                ]
            );

        }
    }, [isFocused]
    )
    //#endregion sync effect

    //#region value
    const value = useMemo(() => ({
        cameraPermission,
        activeCamera,
        syncPermissionStatus,
        scannedBarcodes,
        addNewBarcode,
    }), [cameraPermission, syncPermissionStatus]);

    return (
        <CameraContext.Provider value={value as CameraContextValue}>
            {children}
        </CameraContext.Provider>
    );
};
//#endregion provider
