import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Pobierz dane usera (tutaj symulacja lub z tokenu, 
        // ale w prawdziwym api warto miec endpoint /auth/me)
        // Zakładamy, że backend ma taki endpoint lub pobieramy cokolwiek
        // Na potrzeby demo:
        const fetchUser = async () => {
            // Mozemy tu dac GET /auth/me jesli istnieje,
            // w przeciwnym razie tylko wyswietlimy placeholder
            try {
                 // const res = await api.get('/auth/me');
                 // setUser(res.data);
                 setUser({ name: "Student Jan", email: "student@example.com" });
            } catch(e) {}
        }
        fetchUser();
    }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      <Avatar.Icon size={80} icon="account" style={{marginBottom: 20}} />
      <Text variant="headlineSmall">{user?.name || 'Użytkownik'}</Text>
      <Text variant="bodyMedium" style={{color: 'gray', marginBottom: 40}}>{user?.email || 'email@example.com'}</Text>

      <Button mode="contained" onPress={logout} style={{ width: '100%' }} buttonColor="red">
        Wyloguj się
      </Button>
      
      <Text variant="bodySmall" style={{marginTop: 'auto'}}>Better BT v1.0 (Student Project)</Text>
    </View>
  );
}
