import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importy ekranów z Tabów
import HomeScreen from '../screens/HomeScreen';
import TripsListScreen from '../screens/TripsListScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { useTheme } from 'react-native-paper';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trips') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: true,
        headerStyle: {
            backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Pulpit' }} />
      <Tab.Screen name="Trips" component={TripsListScreen} options={{ title: 'Moje Wyjazdy' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
