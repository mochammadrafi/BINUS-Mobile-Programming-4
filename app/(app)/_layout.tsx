import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function AppLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  // If no user is logged in, navigate to login screen
  useEffect(() => {
    if (!user) {
      router.navigate('/(auth)/login');
    }
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Peta',
          tabBarIcon: ({ color }) => 
            Platform.OS === 'ios' 
              ? <IconSymbol size={28} name="house.fill" color={color} />
              : <MaterialIcons name="map" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="surveys"
        options={{
          title: 'Survey',
          tabBarIcon: ({ color }) => 
            Platform.OS === 'ios'
              ? <IconSymbol size={28} name="paperplane.fill" color={color} />
              : <MaterialIcons name="list" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => 
            Platform.OS === 'ios'
              ? <IconSymbol size={28} name="paperplane.fill" color={color} />
              : <MaterialIcons name="person" size={28} color={color} />,
        }}
      />
      
      {/* These screens don't show in tabs but are part of the app flow */}
      <Tabs.Screen name="new-survey" options={{ href: null }} />
      <Tabs.Screen name="survey-detail" options={{ href: null }} />
    </Tabs>
  );
}
