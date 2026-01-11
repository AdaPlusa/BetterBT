import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';

// Importy ekranów
import LoginScreen from './screens/LoginScreen';
import ServerSettingsScreen from './screens/ServerSettingsScreen';
import MainTabNavigator from './navigation/MainTabNavigator';
import TripDetailsScreen from './screens/TripDetailsScreen';
import TicketScreen from './screens/TicketScreen';
import HotelScreen from './screens/HotelScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ServerSettings">
          <Stack.Screen name="ServerSettings" component={ServerSettingsScreen} options={{ title: 'Ustawienia' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          
          {/* Główna nawigacja po zalogowaniu */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} /> 
          
          {/* Ekrany szczegółowe (poza dolnymi zakładkami) */}
          <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ title: 'Szczegóły Wyjazdu' }} />
          <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: 'Twój Bilet' }} />
          <Stack.Screen name="Hotel" component={HotelScreen} options={{ title: 'Hotel' }} />
          <Stack.Screen name="ExpensesList" component={require('./screens/ExpensesListScreen').default} options={{ title: 'Wydatki' }} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Nowy Wydatek' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
