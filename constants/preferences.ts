
export type colorScheme = "light" | "dark" | "system";

export type userPreferences = {
    theme: colorScheme;
    fontSize?: "medium" | "large" | "x-large";
    fontFamily?: "default" | "serif" | "sans-serif" | "monospace";
    boldText?: boolean;
    highContrast?: boolean;
    reduceMotion?: boolean;
    screenReaderEnabled?: boolean;
    hapticFeedback?: boolean;
    notificationsEnabled?: boolean;
    soundEffects?: boolean;
    language?: string;
    autoPlayVideos?: boolean;
    dataUsage?: "low" | "normal" | "high";
    colorBlindMode?: "none" | "protanopia" | "deuteranopia" | "tritanopia";
    textToSpeechRate?: number;
    zoomLevel?: number;
    rememberMe?: boolean;
    cameraPermissions?: boolean;
    microphonePermissions?: boolean;
    locationPermissions?: boolean;
};
export const defaultUserPreferences = {
    theme: "light",
    fontSize: "medium",
    fontFamily: "default",
    boldText: false,
    highContrast: false,
    reduceMotion: false,
    screenReaderEnabled: false,
    hapticFeedback: true,
    notificationsEnabled: true,
    soundEffects: true,
    language: "en",
    autoPlayVideos: false,
    dataUsage: "normal",
    colorBlindMode: "none",
    textToSpeechRate: 1,
    zoomLevel: 1,
    rememberMe: false,
    cameraPermissions: false,
    microphonePermissions: false,
    locationPermissions: false,
} as userPreferences;

export default defaultUserPreferences; 