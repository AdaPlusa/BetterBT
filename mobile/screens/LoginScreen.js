import React, { useState } from 'react';
import { View, Alert, ImageBackground, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const theme = useTheme();

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
        <ImageBackground 
            source={require('../assets/images/login_bg.jpg')} 
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text variant="displaySmall" style={{ textAlign: 'center', marginBottom: 30, color: theme.colors.primary, fontWeight: 'bold' }}>Better BT</Text>
                    <TextInput 
                        label="Email" 
                        value={email} 
                        onChangeText={setEmail} 
                        mode="outlined" 
                        style={{ marginBottom: 10 }} 
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="email" />}
                    />
                    <TextInput 
                        label="Hasło" 
                        value={password} 
                        onChangeText={setPassword} 
                        mode="outlined" 
                        secureTextEntry 
                        style={{ marginBottom: 20 }}
                        left={<TextInput.Icon icon="lock" />}
                    />

                    <Button mode="contained" onPress={handleLogin} style={{ paddingVertical: 5 }}>Zaloguj</Button>

                    <Button onPress={() => navigation.navigate('ServerSettings')} style={{ marginTop: 20 }}>
                        Zmień IP Serwera
                    </Button>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent dark overlay
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});
