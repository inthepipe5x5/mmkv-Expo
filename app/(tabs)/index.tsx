import React, { useRef } from 'react';
import { StyleSheet, Platform, Pressable, useColorScheme, View, Text, Button, TextInput } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CacheTestText from '@/components/CacheTestText';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Colors, light, dark } from '@/constants/Colors';
import { RelativePathString, Stack, useRouter } from 'expo-router';
import { TabLayoutRouteMapping } from './_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SVGImage from '@/components/SVGImage';
import { useStorageContext } from '@/components/contexts/StorageProvider';
import CuratedImage from '@/components/CuratedImage';
import { CONTENT_GAP, viewPort } from '@/constants/dimensions';
import AuthSheet from '@/components/CustomSheets/AuthSheets';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Fab, FabLabel, FabIcon } from '@/components/ui/fab';
import { LucideScanBarcode, Menu } from 'lucide-react-native';
// import { TermsAndConditionsSheet } from '@/screens/auth/TermsAndConditionsSheet';
import { useQuery } from '@tanstack/react-query';
import { getHouseholdAndInventoryTemplates } from '@/lib/supabase/register';
import supabase from '@/lib/supabase/supabase';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';

//#region default component
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const ParentContainer = Platform.OS === 'web' ? View : GestureHandlerRootView
  const sheetRef = useRef<TrueSheet>(null);
  const authSheetRef = useRef<TrueSheet>(null);
  const termsConditionsSheetRef = useRef<TrueSheet>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { cache } = useStorageContext();
  const router = useRouter();
  const [barcodes, setBarcodes] = React.useState<string[]>([]);
  const [testInputVal, setTestInputVal] = React.useState<string>('');
  const toast = useToast();

  const ShowBottomSheet = () => {
    sheetRef.current?.resize(2);
  }
  //#region useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ["householdInventoryTemplates"],
    queryFn: async () => {
      const data = await getHouseholdAndInventoryTemplates();
      return data;
    }
  })
  //#endregion useQuery


  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="title">Loading...</ThemedText>
        <Spinner
          size="large"
          color={Colors[colorScheme ?? 'light'].accent}
        />
      </ThemedView>
    )
  }
  if (error) {
    console.error('Error fetching templates:', error);
    toast.show({
      duration: 3000,
      placement: "bottom",
      render: () => {
        return (
          <Toast
            action="error"
            variant="outline"
            className="text-info-500 p-2 m-5"
          >
            <ToastTitle>
              Error fetching templates
            </ToastTitle>
            <ToastDescription>
              {JSON.stringify(error.message, null, 4)}
            </ToastDescription>
          </Toast>
        )
      }
    })
  }

  //#region toast
  // toast.show({
  //   duration: 3000,
  //   placement: "bottom",
  //   render: () => {
  //     return (
  //       <Toast
  //         action="success"
  //         variant="solid"
  //         className="text-typography-white p-2 m-5"
  //       >
  //         <ToastTitle>
  //           Initialized!
  //         </ToastTitle>
  //         <ToastDescription>
  //           App initialized successfully!
  //         </ToastDescription>
  //       </Toast>
  //     )
  //   }
  // })
  //#endregion toast

  return (
    <ParentContainer style={styles.parentContainer}>
      <ParallaxScrollView
        headerImage={
          <>
            <Fab
              className="bg-success-400"
              size="sm"
              placement="bottom left"
              onPress={() => ShowBottomSheet()}
              focusable={true}
              accessibilityLabel="Open Bottom Sheet"
              isFocusVisible={true}
            >
              <FabIcon
                as={Menu}
                size="lg"
                color={Colors[colorScheme ?? 'light'].background}
              />
              <FabLabel>
                Routes
              </FabLabel>
            </Fab>
            <CuratedImage
            />
          </>
          // <Image
          //   source={require('@/assets/images/partial-react-logo.png')}
          //   style={styles.reactLogo}
          // />
          // <SVGImage
          //   // uri={require('@/assets/svg/feedback/creative-draft.svg')}
          //   uri={Pexels.get}
          // />
        }>
        {/* <Stack
          screenOptions={{
            title: 'Home',
            headerShown: true,
          }}
        /> */}

        <Fab
          size="lg"
          placement="bottom left"
          android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}
          onPress={async () => {
            // await TrueSheet.dismiss("landingPageSheet");
            // await TrueSheet.dismiss("SIGN_IN_SHEET");

            router.push('/camera/codeScanner')
          }}
        >
          <FabIcon
            as={LucideScanBarcode}
            size="lg"
            color={Colors[colorScheme ?? 'light'].background}
          />
          <FabLabel>
            Open Bar Code Scanner
          </FabLabel>
        </Fab>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome!</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 1: Try it</ThemedText>
          <CacheTestText />
          <View style={{ marginBottom: 8 }}>
            <Button
              title="Open Bottom Sheet"
              onPress={async () => await ShowBottomSheet()}
              color={Colors[colorScheme ?? 'light'].accent}
              accessibilityLabel="Open Bottom Sheet"
            />
          </View>


          <View style={{ marginBottom: 8 }}>
            <Button
              title="Open Camera"
              onPress={() => router.push('/camera')}
              color={Colors[colorScheme ?? 'light'].accent}
              accessibilityLabel="Open Bottom Sheet"
            />
            <SVGImage
              uri={require('@/assets/svg/feedback/creative-draft.svg')}
            />
          </View>
          <Pressable
            style={{ padding: 10, marginHorizontal: 5 }}
            android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}
            onPress={() => {
              sheetRef.current?.resize(1);
              router.push('/camera/codeScanner')
            }}>
            <View style={{
              flexDirection: "row",
              minWidth: 200, height: 28,
              borderRadius: 14
            }} >
              <MaterialIcons name="qr-code" size={28} color={Colors[colorScheme ?? 'light'].accent} />
              <Text>Open Barcode Scanner</Text>
            </View>
          </Pressable>
          <Pressable
            style={{ padding: 10, marginHorizontal: 5 }}
            android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}
            onPress={() => {
              sheetRef.current?.resize(1);
              router.push('/auth/SignIn')
            }}>
            <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
              <MaterialIcons name="qr-code" size={28} color={Colors[colorScheme ?? 'light'].accent} />
              <Text>Open "/welcome"</Text>
            </View>
          </Pressable>
          <Pressable
            style={{ padding: 10, marginHorizontal: 5 }}
            android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}
            onPress={() => {
              console.log('auth sheet pressed');
              sheetRef.current?.dismiss();
              TrueSheet.present("SIGN_IN_SHEET", 1);
              // router.push('/auth/SignIn')
            }}>
            <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
              <MaterialIcons name="lock" size={28} color={Colors[colorScheme ?? 'light'].accent} />
              <Text>OPEN AUTH SHEET</Text>
            </View>
          </Pressable>
          <Pressable
            style={{ padding: 10, marginHorizontal: 5 }}
            android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}
            onPress={() => {
              console.log('terms and conditions sheet pressed');
              sheetRef.current?.dismiss();
              // TrueSheet.present("termsAndConditionsSheet", 1);
              // termsConditionsSheetRef.current?.resize(1);
              // router.push('/auth/SignIn')
            }}>
            <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
              <MaterialIcons name="lock" size={28} color={Colors[colorScheme ?? 'light'].accent} />
              <Text>OPEN TERMS SHEET</Text>
            </View>
          </Pressable>
          <ThemedText type="title">Templates</ThemedText>
          <ThemedText type="subtitle">Household and Inventory</ThemedText>
          <ThemedText>
            {JSON.stringify(data, null, 4)}
          </ThemedText>
          <TrueSheet
            name="landingPageSheet"
            ref={sheetRef}
            initialIndex={0}
            initialIndexAnimated={Platform.OS === 'ios'}
            sizes={['auto', '50%', '85%']}
            dimmedIndex={2}
            onMount={() => {
              const cachedBarcodes = cache.getItem('scannedBarcodes') ?? null;
              console.log('Sheet mounted, cached barcodes:', cachedBarcodes);
              switch (true) {
                case cachedBarcodes === null:
                  console.log('No cached barcodes found');
                  break;
                default:
                  setBarcodes(cachedBarcodes as unknown as string[]);
              }
            }}
            onPresent={() => {
              const cachedBarcodes = cache.getItem('scannedBarcodes') ?? null;
              console.log('Sheet mounted, cached barcodes:', cachedBarcodes);
              switch (true) {
                case cachedBarcodes === null:
                  console.log('No cached barcodes found');
                  break;
                default:
                  setBarcodes(cachedBarcodes as unknown as string[]);
              }
            }}

          >
            <ScrollView
              ref={scrollRef}
              nestedScrollEnabled
              contentContainerStyle={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                minHeight: viewPort.devices.mobile.height * 2,
                paddingVertical: CONTENT_GAP
              }}
              stickyHeaderIndices={[0]}
            >
              <View
                style={{
                  // margin: 10,
                  padding: 10,
                  width: '100%',
                }}
              >
                <TextInput
                  value={testInputVal}
                  placeholder="Type here..."
                  onChangeText={(text: string) => setTestInputVal(text)}
                  style={{
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    borderColor: Colors[colorScheme ?? 'light'].accent,
                    padding: 10,
                    borderRadius: 8
                  }}
                />
              </View>

              <View style={{
                alignContent: 'center',
                width: '100%'
              }}>

                <Text style={{
                  marginHorizontal: 10,
                  fontSize: 20,
                  fontWeight: 'bold'
                }}>
                  Routes</Text>

                {
                  Object.entries(TabLayoutRouteMapping).map(([key, value]) => (
                    <Pressable
                      key={key}
                      style={{ padding: 10, marginHorizontal: 5 }}
                      android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}

                      onPress={
                        () => {
                          console.log('Route pressed', JSON.stringify({ key, value }, null, 4));
                          // sheetRef.current?.dismiss();
                          // TrueSheet.dismiss("SIGN_IN_SHEET");
                          router.push(value.name as unknown as RelativePathString);
                        }}
                    >
                      <View style={{
                        flexDirection: "row",
                        minWidth: 200,
                        height: 28,
                        borderRadius: 14,
                        justifyContent: "flex-start"
                      }} >
                        <IconSymbol name={value.icon} size={28} color={Colors[colorScheme ?? 'light'].accent} />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: Colors[colorScheme ?? 'light'].text,
                            marginRight: "auto",
                            marginLeft: 50
                          }}
                        >{String(value?.options?.title ?? "Route")}</Text>
                      </View>
                    </Pressable>
                  ))
                }
              </View>
            </ScrollView>
          </TrueSheet>
          <AuthSheet ref={authSheetRef}
          />
        </ThemedView>
      </ParallaxScrollView>
    </ParentContainer >
  );
}
//#endregion default component
const styles = StyleSheet.create({
  parentContainer: {
    flexGrow: 1,
    // paddingTop: CONTENT_GAP * 2,
    gap: CONTENT_GAP,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
