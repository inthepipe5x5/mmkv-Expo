import "@/global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StorageContextProvider } from '@/components/contexts/StorageProvider';
import { AuthProvider } from '@/components/contexts/SupabaseProvider';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { mmkvGeneralPersister } from "@/lib/mmkv/persister";
import { Appearance, Platform } from 'react-native';
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { ToastComponentProps } from "@gluestack-ui/toast/lib/types";
import { SessionResourceProvider } from "@/components/contexts/UserHouseholdsContext";
import { UIThemeContextProvider } from "@/components/contexts/UIThemeContext";
import { CurrentHouseholdProvider } from "@/components/contexts/CurrentHouseholdContext";
import { ScreenHistoryProvider } from "@/components/contexts/ScreenHistoryContext";
// Removed invalid backgroundColor property
SplashScreen.setOptions({
  duration: 500,
  fade: Platform.OS === "ios",
});
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
//#region RootLayout
export default function RootLayout() {
  const colorScheme = Appearance.getColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const toast = useToast();

  useEffect(() => {
    // Hide the splash screen once the app is ready
    if (loaded) {
      SplashScreen.hideAsync();
    }

    toast.show({
      duration: 2000,
      placement: "bottom",
      render: ({ id }: ToastComponentProps) => (
        <Toast
          nativeID={id}
          variant="solid"
          action={loaded ? "success" : "error"}
          onLayout={(e) => {
            console.log("Toast layout", e.nativeEvent.layout);
          }}
        >
          <ToastTitle>{loaded ? "App is ready" : "Loading..."}</ToastTitle>
          <ToastDescription>
            {loaded ? "Assets loaded" : "Loading assets..."}
          </ToastDescription>
        </Toast>
      )
    })

  }, [loaded]);

  if (!loaded) {
    SplashScreen.preventAutoHideAsync();

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
      <GluestackUIProvider
      // mode={"system" as ModeType}
      >
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
            <ScreenHistoryProvider>
              <AuthProvider>
                <SessionResourceProvider>
                  <UIThemeContextProvider>
                    <CurrentHouseholdProvider>

                      <Stack
                        initialRouteName="(tabs)"
                        screenOptions={{
                          headerShown: false,
                        }}
                      >

                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                      {Platform.OS === "android" ? (
                        <StatusBar
                          style="light"
                        />
                      ) : (
                        <StatusBar
                          style="auto"
                          hideTransitionAnimation={Platform.OS === 'ios' ? "fade" : undefined}
                        />
                      )}
                    </CurrentHouseholdProvider>
                  </UIThemeContextProvider>
                </SessionResourceProvider>
              </AuthProvider>
            </ScreenHistoryProvider>
          </PersistQueryClientProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </StorageContextProvider>
    // </RootContextProvider>
  );
}
