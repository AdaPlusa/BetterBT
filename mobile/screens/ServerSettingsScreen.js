import React, { useState, useEffect, useContext } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text, Switch, List, useTheme, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

export default function ServerSettingsScreen({ navigation }) {
  const [ip, setIp] = useState('');
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();

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
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <Text variant="headlineMedium" style={{marginBottom: 30, textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary}}>Ustawienia Aplikacji</Text>
      
      <Card style={{ marginBottom: 20, backgroundColor: theme.colors.surface }} mode="elevated">
        <Card.Content>
            <Text style={{marginBottom: 10, color: theme.colors.onSurface}}>Adres IP Serwera (API):</Text>
            <TextInput
                label="Adres IP (np. 192.168.1.15)"
                value={ip}
                onChangeText={setIp}
                mode="outlined"
                keyboardType="numeric"
                style={{ backgroundColor: theme.colors.surface }}
            />
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 30, backgroundColor: theme.colors.surface }} mode="elevated">
          <List.Item
            title="Tryb Ciemny"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={props => <Switch value={isDark} onValueChange={toggleTheme} color={theme.colors.primary} />}
          />
      </Card>

      <Button 
        mode="contained" 
        onPress={saveSettings} 
        style={{ marginTop: 10, paddingVertical: 5 }}
        icon="check"
      >
        Zapisz i Wróć
      </Button>
    </View>
  );
}
