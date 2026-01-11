import React, { useState } from 'react';
import { View, Image, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function AddExpenseScreen({ route, navigation }) {
    // Możemy dostać tripId z parametrów (jeśli przeszliśmy z listy)
    // Jeśli nie, powinniśmy pozwolić wybrać wyjazd (ale uprośćmy dla studenta)
    const { tripId } = route.params || {};

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // Pytamy o uprawnienia
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true, // Potrzebujemy base64 do wysłania
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const submitExpense = async () => {
        if (!amount || !description || !tripId) {
            Alert.alert("Błąd", "Wypełnij kwotę, opis i upewnij się, że dodajesz do konkretnego wyjazdu.");
            return;
        }

        setLoading(true);
        try {
            // Budujemy payload
            const payload = {
                tripId,
                amount: parseFloat(amount),
                currency: "PLN", // hardcoded for MVP
                category: "Inne",
                description,
                receiptImage: image ? `data:image/jpeg;base64,${image.base64}` : null
            };

            // Tutaj normalnie byłby POST /expenses
            // Ale zróbmy console.log i symulację sukcesu, chyba że backend jest gotowy
            // await api.post('/expenses', payload);
            
            console.log("Wysyłanie wydatku:", payload);
            
            Alert.alert("Sukces", "Wydatek dodany!");
            navigation.goBack();
        } catch(e) {
            Alert.alert("Błąd", "Nie udało się dodać wydatku.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text variant="headlineSmall" style={{marginBottom: 20}}>Dodaj Wydatek</Text>
            
            <TextInput 
                label="Kwota (PLN)" 
                value={amount} 
                onChangeText={setAmount} 
                keyboardType="numeric" 
                mode="outlined" 
                style={{marginBottom: 10}}
            />
            
            <TextInput 
                label="Opis (np. Obiadek)" 
                value={description} 
                onChangeText={setDescription} 
                mode="outlined" 
                style={{marginBottom: 20}}
            />

            <Button icon="camera" mode="contained-tonal" onPress={pickImage} style={{marginBottom: 20}}>
                Zrób zdjęcie paragonu
            </Button>

            {image && (
                <Image source={{ uri: image.uri }} style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 20 }} />
            )}

            <Button mode="contained" onPress={submitExpense} loading={loading} disabled={loading}>
                Zapisz Wydatek
            </Button>
        </ScrollView>
    );
}
