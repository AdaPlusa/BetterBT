import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      // Zapisz token
      await AsyncStorage.setItem('token', res.data.token);
      // Idź do głównej aplikacji
      navigation.replace('MainTabs'); 
    } catch (error) {
      console.error(error);
      Alert.alert("Błąd", "Nie udało się połączyć. Sprawdź IP lub hasło.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text variant="displaySmall" style={{textAlign: 'center', marginBottom: 30}}>Better BT</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={{marginBottom: 10}} autoCapitalize="none"/>
      <TextInput label="Hasło" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={{marginBottom: 20}}/>
      
      <Button mode="contained" onPress={handleLogin}>Zaloguj</Button>
      
      <Button onPress={() => navigation.navigate('ServerSettings')} style={{marginTop: 20}}>
        Zmień IP Serwera
      </Button>
    </View>
  );
}
