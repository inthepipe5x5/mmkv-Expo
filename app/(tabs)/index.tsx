import React, { useRef } from 'react';
import { Image, StyleSheet, Platform, Pressable, useColorScheme, View, Text, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CacheTestText from '@/components/CacheTestText';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Colors } from '@/constants/Colors';
import { RelativePathString, useRouter } from 'expo-router';
import { TabLayoutRouteMapping } from './_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';



export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const ParentContainer = Platform.OS === 'web' ? View : GestureHandlerRootView
  const sheetRef = useRef<TrueSheet>(null);
  const router = useRouter();


  const ShowBottomSheet = () => {
    sheetRef.current?.resize(2);
  }


  return (
    <ParentContainer style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
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
              color={Colors[colorScheme ?? 'light'].tint}
              accessibilityLabel="Open Bottom Sheet"
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Button
              title="Open Camera"
              onPress={() => router.push('/camera')}
              color={Colors[colorScheme ?? 'light'].tint}
              accessibilityLabel="Open Bottom Sheet"
            />
          </View>
          <ThemedText>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
            Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: 'cmd + d',
                android: 'cmd + m',
                web: 'F12'
              })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          <ThemedText>
            Tap the Explore tab to learn more about what's included in this starter app.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
          <ThemedText>
            When you're ready, run{' '}
            <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
            <ThemedText type="defaultSemiBold">app-example</ThemedText>.
          </ThemedText>
        </ThemedView>
        <TrueSheet
          ref={sheetRef}
          initialIndex={1}
          initialIndexAnimated={Platform.OS === 'ios'}
          sizes={['20%', '50%', '85%']}
        >
          <ScrollView
            style={{ flexDirection: 'row', padding: 10 }}>
            {TabLayoutRouteMapping.map((route, index) => (
              <Pressable
                key={index}
                // name={route.name}
                // options={route.options}
                style={{ padding: 10, marginHorizontal: 5 }}
                android_ripple={{ color: Colors[colorScheme ?? 'light'].tint }}
                onPress={() => {
                  sheetRef.current?.resize(2);
                  console.log('Tab pressed:', route.name);
                  router.push(route.name as RelativePathString);
                }}
              >
                <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
                  {/* <IconSymbol
                    size={28}
                    name={MAPPING[route.icon] as SFSymbols6_0 ?? 'map'}
                    color={Colors[colorScheme ?? 'light'].tint}
                  /> */}
                  <Text>{route.name}</Text>
                </View>
                {/* <IconSymbol
                size={28}
                name={MAPPING[route.icon] as SFSymbols6_0 ?? 'map'}
                color={Colors[colorScheme ?? 'light'].tint}
              /> */}
              </Pressable>
            ))}
            <Pressable
              style={{ padding: 10, marginHorizontal: 5 }}
              android_ripple={{ color: Colors[colorScheme ?? 'light'].tint }}
              onPress={() => {
                sheetRef.current?.resize(1);
                router.push('/camera')
              }}>
              <View style={{ flexDirection: "row", minWidth: 200, height: 28, borderRadius: 14 }} >
                <MaterialIcons name="camera" size={28} color={Colors[colorScheme ?? 'light'].tint} />
                <Text>Open Camera</Text>
              </View>
            </Pressable>
          </ScrollView>
        </TrueSheet>
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
