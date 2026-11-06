import { router, Tabs } from 'expo-router';
import { BarChart3, BookOpenText, Home, Sprout, UserRound } from 'lucide-react-native';
import { useEffect } from 'react';

import { getCurrentUser } from '../../lib/farmApi';

export default function TabLayout() {
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/auth/sign-in');
      }
    })();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#236b45',
        tabBarInactiveTintColor: '#7b8d80',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
          position: 'absolute',
          borderTopWidth: 0,
          shadowColor: '#0e3d2a',
          shadowOpacity: 0.1,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -4 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />, 
        }}
      />
      <Tabs.Screen
        name="farm"
        options={{
          title: 'My Farm',
          tabBarIcon: ({ color, size }) => <Sprout color={color} size={size} />, 
        }}
      />
      <Tabs.Screen
        name="simulations"
        options={{
          title: 'Simulations',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />, 
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <BookOpenText color={color} size={size} />, 
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />, 
        }}
      />
    </Tabs>
  );
}
