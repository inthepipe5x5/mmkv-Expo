import { useWindowDimensions, Platform } from "react-native";
import { Code } from "react-native-vision-camera";

/**
 * Normalizes barcodes according to Open Food Facts documentation.
 * {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-barcode-normalization/}
 * @param barcode - The barcode to normalize.
 * @returns The normalized barcode.
 */
const normalizeBarcode = (barcode: string): string => {
    // Remove leading zeros
    let normalizedBarcode = barcode.replace(/^0+/, '');

    // Normalize based on the length of the barcode
    if (normalizedBarcode.length <= 7) {
        // Pad with leading zeros to make it 8 digits
        normalizedBarcode = normalizedBarcode.padStart(8, '0');
    } else if (normalizedBarcode.length >= 9 && normalizedBarcode.length <= 12) {
        // Pad with leading zeros to make it 13 digits
        normalizedBarcode = normalizedBarcode.padStart(13, '0');
    }

    return normalizedBarcode;
};

export default normalizeBarcode;


//#region Calculate Overlay Area
export const SquareOverlayArea = (
    SQUARE_SIZE = 200
): {
    x: number //difference between the screen width and the square width
    y: number //difference between the screen height and the square height
    width: number //width of the square
    height: number //height of the square
} => {
    const {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    } = useWindowDimensions();
    // Calculate the square overlay area based on the screen dimensions
    return Platform.OS === "android"
        ? {
            x: 0, // Full width for Android because the barcode scanning area is the full screen
            y:
                (SCREEN_HEIGHT -
                    SQUARE_SIZE) /
                2,
            width: SCREEN_WIDTH,
            height: SQUARE_SIZE,
        }
        : {
            x:
                (SCREEN_WIDTH - SQUARE_SIZE) /
                2,
            y:
                (SCREEN_HEIGHT -
                    SQUARE_SIZE) /
                2,
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
        };
};

// utility function to check if the scanned code is within the overlay area
export const CalculateWithinOverlay = ({ code, overlaySize }:
    { code: Code, overlaySize?: number | null }): Boolean => {
    

    const emptyBounds = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    // Check if the code is a valid object and has the required properties
    if (!code || typeof code !== 'object') {
        console.error("Invalid code object:", code);
        return false; // Invalid code object, return false
    }
    // Calculate the position of the code within the overlay area
    const boundaryKeys = ['frame', 'corners', 'bounds', 'cornerPoints'];
    // Check if the code has any of the boundary keys
    const hasBoundaries = boundaryKeys.find((key) => {
        return (key in code) && Boolean((code as any)[key]);
    });

    if (!hasBoundaries && Object.keys(code).length !== Object.keys(emptyBounds).length) {
        console.error("Code does not have the required boundaries:", code);
        return false; // No boundaries found, return false
    }

    const { x, y, width, height } = hasBoundaries && hasBoundaries in code
        ? (code as any)[hasBoundaries]
        : emptyBounds

    // Assuming a square size of 200 for the overlay  
    const area = SquareOverlayArea(overlaySize ?? 200);
    // Check full barcode bounds
    const isWithinX = x >= area.x && (x + width) <= (area.x + area.width);
    const isWithinY = y >= area.y && (y + height) <= (area.y + area.height);
    return isWithinX && isWithinY;
}
