"use strict";

/** context for the UI theme based on user preference or system settings
 * 
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useStorageContext } from './StorageProvider';
import { dark, light } from '@/constants/Colors';
import { useSessionResourceContext } from './UserHouseholdsContext';

type UIThemeContextType = {
    theme: "light" | "dark";
    setTheme: (value: "light" | "dark") => void;
    colorPalette: typeof light | typeof dark | null;
};
// #region create context
export const UIThemeContext = createContext<UIThemeContextType>({
    theme: "light",
    setTheme: () => { },
    colorPalette: null,
});

// #endregion create context


// #region provider
/** UIThemeContextProvider component
 *
  * @param {React.PropsWithChildren} props - The component's props.
  * @returns {JSX.Element} The UIThemeContextProvider component.
  */
export const UIThemeContextProvider = ({ children }: React.PropsWithChildren) => {
    const { cache } = useStorageContext();
    const { currentProfile } = useSessionResourceContext();

    const colorScheme = useColorScheme();
    const [theme, setTheme] = useState<"light" | "dark">(useColorScheme() === "dark" ? "dark" : "light");
    const [colorPalette, setColorPalette] = useState<typeof light | typeof dark | null>(null);

    //helper function to detect theme key changes
    const handleThemeChange = useCallback((newTheme: "light" | "dark" | "system") => {
        if (newTheme === "system") {
            applyTheme(colorScheme === "dark" ? "dark" : "light");
        } else if (newTheme === "dark" || newTheme === "light") {
            applyTheme(newTheme);
        }
    }, [])

    // Helper to apply a theme and update state/cache
    const applyTheme = useCallback((themeValue: "light" | "dark") => {
        setTheme(themeValue);
        setColorPalette(themeValue === "dark" ? dark : light);
        cache.setItem('theme', themeValue);
    }, []);

    // Initial theme and cache listener
    useEffect(() => {
        let cachedTheme = cache.getItem('theme') ?? cache.getItem("user.preferences.theme") as "light" | "dark" | "system" | null;
        let resolvedTheme: "light" | "dark" = "light";
        if (cachedTheme === "system") {
            resolvedTheme = colorScheme === "dark" ? "dark" : "light";
        } else if (cachedTheme === "dark" || cachedTheme === "light") {
            resolvedTheme = cachedTheme;
        }
        handleThemeChange(resolvedTheme);

        // Listen for theme changes in cache
        const cachedThemeListener = cache.storage.addOnValueChangedListener((key: string) => {
            const currentTheme = theme;
            switch (key) {
                case "theme":
                case "user.preferences.theme":
                case "currentProfile.preferences.theme":
                    const newTheme = (cache.getItem(key) as "light" | "dark" | "system" | null) ?? "light";
                    // if the new theme is different from the current theme, apply it
                    if (newTheme !== currentTheme) handleThemeChange(newTheme ?? "system");
                    //proceed
                    break;
                default:
                    // do nothing
                    break;
            }

            if (__DEV__) {
                console.log("UIThemeContextProvider cache listener", { key, theme });
            }
        });

        // Cleanup the listener on unmount
        return () => {
            // Remove the listener if it exists (bug in MMKV where the remove doesn't exist)
            if (cachedThemeListener && typeof cachedThemeListener.remove === 'function') {
                cachedThemeListener.remove();
            }
        };
    }, [colorScheme, cache]);

    // Listen for changes in currentProfile.preferences.theme
    useEffect(() => {
        let profileTheme: string | undefined;
        if (typeof currentProfile?.preferences === "string") {
            try {
                profileTheme = JSON.parse(currentProfile.preferences)?.theme;
            } catch {
                profileTheme = undefined;
            }
        }
        if (profileTheme === "dark" || profileTheme === "light") {
            applyTheme(profileTheme);
        } else if (profileTheme === "system") {
            applyTheme(colorScheme === "dark" ? "dark" : "light");
        }
    }, [currentProfile?.preferences?.theme, colorScheme]);

    const value = useMemo(() => ({
        theme,
        setTheme: useCallback((value: "light" | "dark") => {
            setTheme(value);
            // setColorPalette(value === "dark" ? dark : light);
        }, []),
        colorPalette,
    }), [theme, colorPalette]);

    return (
        <UIThemeContext.Provider value={value}>
            {children}
        </UIThemeContext.Provider>
    );
}

//#endregion provider