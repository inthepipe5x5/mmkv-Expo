import { Stack, Slot, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol, IconSymbolName, MAPPING } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

type TabLayoutRoute = {
  name: string;
  options?: NativeStackNavigationOptions;
  icon: IconSymbolName;
};
export const TabLayoutRouteMapping = [{
  name: 'index',
  options: {
    title: 'Home',
  },
  icon: "house.fill",
}, {
  name: 'explore',
  options: {
    title: 'Explore',
  },
  icon: "paperplane.fill",
}, {
  name: 'task',
  options: {
    title: 'Task',
  },
  icon: "chevron.left.forwardslash.chevron.right",
}, {
  name: 'create-tasks',
  options: {
    title: 'Create Task',
  },
  icon: "message.fill",
},
] as TabLayoutRoute[];

export default function TabLayout() {

  return (
    <Stack
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        // tabBarButton: HapticTab,
        // tabBarBackground: TabBarBackground,
        // tabBarStyle: Platform.select({
        //   ios: {
        //     // Use a transparent background on iOS to show the blur effect
        //     position: 'absolute',
        //   },
        //   default: {},
        // }),
      }}>
      {TabLayoutRouteMapping.map((route, index) => (
        <Stack.Screen
          key={index}
          name={route.name}
          options={route.options}
        />
      ))}
      {/* <Stack.Screen
          name="index"
          options={{
            title: 'Home',
            // tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Stack.Screen
          name="explore"
          options={{
            title: 'Explore',
            // tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        <Stack.Screen
          name="task"
        // options={{
        // tabBarIcon: ({ color, focused, size }) => {
        //   const iconName = focused ? 'c.circle.fill' : 'c.circle';
        //   return <IconSymbol size={size} name={iconName} color={color} />;
        // }
        // }}
        />
        <Stack.Screen
          name="create-tasks"
        // options={{
        // tabBarIcon: ({ color, focused, size }) => {
        //   const iconName = 'outgoing-mail'
        //   return <IconSymbol size={size} name={iconName} color={color} />;
        // }
        // }}
        /> */}
      {/* <Stack.Screen
        name="camera"
      // options={{
      //   // title: 'Scan',
      //   headerShown: false,
      //   tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
      // }}
      /> */}
    </Stack>
  );
}
