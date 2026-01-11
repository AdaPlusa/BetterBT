import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ServerSettingsScreen({ navigation }) {
  const [ip, setIp] = useState('');

  useEffect(() => {
    // Wczytaj obecne IP przy starcie
    AsyncStorage.getItem('serverIp').then(val => {
        if(val) setIp(val);
    });
  }, []);

  const saveSettings = async () => {
    await AsyncStorage.setItem('serverIp', ip);
    // Przejdź do logowania
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text variant="headlineMedium" style={{marginBottom: 20}}>Konfiguracja Serwera</Text>
      <Text style={{marginBottom: 10}}>Podaj IP komputera (sprawdź ipconfig):</Text>
      <TextInput
        label="Adres IP (np. 192.168.1.15)"
        value={ip}
        onChangeText={setIp}
        mode="outlined"
        keyboardType="numeric"
      />
      <Button mode="contained" onPress={saveSettings} style={{ marginTop: 20 }}>
        Zapisz i Przejdź dalej
      </Button>
    </View>
  );
}
