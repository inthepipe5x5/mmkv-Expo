import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMemo } from "react";
import { GeneralCache } from "@/lib/mmkv/index"

const RootContext = createContext<{
  cache: GeneralCache;
  randomNumber: number | null;
  setRandomNumber: (value: number | null) => void;
} | null>(null);

const RootContextProvider = ({ children }: { children: React.ReactNode }) => {
  const cache = useMemo(() => new GeneralCache({}), []);
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  console.log('Pre-fetch random number:', { randomNumber });

  useEffect(() => {
    const previousNumber = cache.getItem('randomNumber');
    console.log('Previous random number from cache:', { previousNumber: previousNumber ?? null });
    //check if previously set random number is falsy
    if (!!!previousNumber) {
      const randomValue = Math.floor(Math.random() * 100);
      setRandomNumber(randomValue);
      cache.setItem('randomNumber', randomValue.toString());
      cache.setItem('randomNumberTimestamp', new Date().toISOString());
      console.log('Random number set:', { randomValue, timestamp: new Date().toISOString() });
    }
    //check if previously set random number is not falsy
    else {
      setRandomNumber(parseInt(previousNumber));
      console.log('Random number retrieved from cache:', { previousNumber });
    }
  }, []);

  return (
    <RootContext.Provider value={{
      cache,
      randomNumber,
      setRandomNumber,
    }}>
      {children}
    </RootContext.Provider >
  );
}
export const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error('useRootContext must be used within a RootContextProvider');
  }
  return context;
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });



  useEffect(() => {
    console.log('MMKV storage:', GeneralCache);
    // Hide the splash screen once the app is ready
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RootContextProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </RootContextProvider>
  );
}
