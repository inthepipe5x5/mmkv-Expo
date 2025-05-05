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
import { StorageContextProvider } from '@/components/contexts/StorageProvider';
import { AuthProvider } from '@/components/contexts/SupabaseProvider';
import { GluestackUIProvider, ModeType } from "@/components/ui/gluestack-ui-provider";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { mmkvGeneralPersister } from "@/lib/mmkv/persister";
import { Appearance } from 'react-native';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
//#region RootLayout
export default function RootLayout() {
  const colorScheme = Appearance.getColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });



  useEffect(() => {
    // Hide the splash screen once the app is ready
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
      },
      mutations: {
        retry: 1,
      },
    },
  })


  return (
    // <RootContextProvider>
    <StorageContextProvider>
      {/* <GluestackUIProvider mode={"system" as ModeType}> */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: mmkvGeneralPersister
          }}
          onError={() => { //for debugging
            console.error("Error persisting query client")
          }}
          onSuccess={() => { //for debugging
            console.log("Query client persisted successfully")
          }}
        >
          <AuthProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </PersistQueryClientProvider>
      </ThemeProvider>
      {/* </GluestackUIProvider> */}
    </StorageContextProvider>
    // </RootContextProvider>
  );
}
