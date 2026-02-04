import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

// Importy ekranów
import LoginScreen from './screens/LoginScreen';
import ServerSettingsScreen from './screens/ServerSettingsScreen';
import MainTabNavigator from './navigation/MainTabNavigator';
import TripDetailsScreen from './screens/TripDetailsScreen';
import TicketScreen from './screens/TicketScreen';
import HotelScreen from './screens/HotelScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';

const Stack = createStackNavigator();

function AppContent() {
  const { theme, isDark } = useContext(ThemeContext);

  // Combine Paper theme with Navigation theme
  const navigationTheme = {
    ...(isDark ? NavigationDarkTheme : NavigationDefaultTheme),
    colors: {
      ...(isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.error,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator initialRouteName="ServerSettings" screenOptions={{ headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: theme.colors.onPrimary }}>
          <Stack.Screen name="ServerSettings" component={ServerSettingsScreen} options={{ title: 'Ustawienia' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
          {/* Główna nawigacja po zalogowaniu */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} /> 
        
          {/* Ekrany szczegółowe */}
          <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ title: 'Szczegóły Wyjazdu' }} />
          <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: 'Twój Bilet' }} />
          <Stack.Screen name="Hotel" component={HotelScreen} options={{ title: 'Hotel' }} />
          <Stack.Screen name="ExpensesList" component={require('./screens/ExpensesListScreen').default} options={{ title: 'Wydatki' }} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Nowy Wydatek' }} />
        
          {/* Nowe ekrany */}
          <Stack.Screen name="ReceiptPreview" component={require('./screens/ReceiptPreviewScreen').default} options={{ title: 'Podgląd' }} />
          <Stack.Screen name="Notifications" component={require('./screens/NotificationsScreen').default} options={{ title: 'Powiadomienia' }} />
          <Stack.Screen name="Contact" component={require('./screens/ContactScreen').default} options={{ title: 'Kontakt' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
