import React, { useRef } from 'react';
import { Image, StyleSheet, Platform, Pressable, useColorScheme, View, Text, Button } from 'react-native';

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

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const ParentContainer = Platform.OS === 'web' ? View : GestureHandlerRootView
  const sheetRef = useRef<TrueSheet>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { cache } = useStorageContext();
  const router = useRouter();
  const [barcodes, setBarcodes] = React.useState<string[]>([]);

  const ShowBottomSheet = async () => {
    await sheetRef.current?.resize(2);
  }

  return (
    <ParentContainer style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: light.background, dark: dark.background }}//{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <CuratedImage
          />
          // <Image
          //   source={require('@/assets/images/partial-react-logo.png')}
          //   style={styles.reactLogo}
          // />
          // <SVGImage
          //   // uri={require('@/assets/svg/feedback/creative-draft.svg')}
          //   uri={Pexels.get}
          // />
        }>
        <Stack
          screenOptions={{
            title: 'Home',
            headerShown: true,
          }}
        />
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
              onPress={ShowBottomSheet}
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
            <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
              <MaterialIcons name="qr-code" size={28} color={Colors[colorScheme ?? 'light'].accent} />
              <Text>Open Barcode Scanner</Text>
            </View>
          </Pressable>
          <Pressable
            style={{ padding: 10, marginHorizontal: 5 }}
            android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}
            onPress={() => {
              sheetRef.current?.resize(1);
              router.push('auth')
            }}>
            <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
              <MaterialIcons name="qr-code" size={28} color={Colors[colorScheme ?? 'light'].accent} />
              <Text>Open "/welcome"</Text>
            </View>
          </Pressable>


          <TrueSheet
            name="landingPageSheet"
            ref={sheetRef}
            initialIndex={1}
            initialIndexAnimated={Platform.OS === 'ios'}
            sizes={['20%', '50%', '85%']}
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
              }}>
              <View style={{ alignContent: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Routes</Text>
                {
                  Object.entries(TabLayoutRouteMapping).map(([key, value]) => (
                    <Pressable
                      key={key}
                      style={{ padding: 10, marginHorizontal: 5 }}
                      android_ripple={{ color: Colors[colorScheme ?? 'light'].accent }}
                      onPress={() => {
                        sheetRef.current?.resize(1);
                        router.push(value as unknown as RelativePathString);
                      }}>
                      <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
                        <MaterialIcons name="qr-code" size={28} color={Colors[colorScheme ?? 'light'].accent} />
                        <Text>{String(value)}</Text>
                      </View>
                    </Pressable>
                  ))
                }
              </View>
            </ScrollView>
          </TrueSheet>
        </ThemedView>
      </ParallaxScrollView>
    </ParentContainer >

  );
}

const styles = StyleSheet.create({
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
