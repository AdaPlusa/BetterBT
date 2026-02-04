import React, { useState } from 'react';
import { View, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Card, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function AddExpenseScreen({ route, navigation }) {
    const { tripId } = route.params || {};
    const theme = useTheme();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Brak uprawnień', 'Aplikacja potrzebuje dostępu do aparatu, aby zrobić zdjęcie paragonu.');
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'], 
                allowsEditing: true,
                aspect: [4, 6],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled) {
                setImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert("Błąd", "Nie udało się otworzyć aparatu.");
        }
    };

    const pickFromGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 6],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled) {
                setImage(result.assets[0]);
            }
        } catch (error) {
             Alert.alert("Błąd", "Nie udało się otworzyć galerii.");
        }
    };

    const submitExpense = async () => {
        if (!amount || !description || !tripId) {
            Alert.alert("Błąd", "Wypełnij kwotę i opis.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseFloat(amount.replace(',', '.')), 
                currency: "PLN",
                category: "Inne",
                description,
                receiptImage: image ? `data:image/jpeg;base64,${image.base64}` : null
            };

            await api.post(`/trips/${tripId}/expenses`, payload);
            
            Alert.alert("Sukces", "Wydatek dodany!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch(e) {
            console.error("Error adding expense:", e);
            Alert.alert("Błąd", "Nie udało się dodać wydatku. Sprawdź połączenie.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Text variant="headlineSmall" style={{marginBottom: 20, fontWeight: 'bold', color: theme.colors.primary}}>Nowy Wydatek</Text>
            
            <Card style={{ padding: 15, marginBottom: 20, backgroundColor: theme.colors.surface }}>
                <TextInput 
                    label="Kwota (PLN)" 
                    value={amount} 
                    onChangeText={setAmount} 
                    keyboardType="numeric" 
                    mode="outlined" 
                    style={{marginBottom: 15, backgroundColor: theme.colors.surface}}
                    left={<TextInput.Icon icon="cash" />}
                />
                
                <TextInput 
                    label="Opis (np. Lunch, Taxi)" 
                    value={description} 
                    onChangeText={setDescription} 
                    mode="outlined" 
                    style={{marginBottom: 5, backgroundColor: theme.colors.surface}}
                    left={<TextInput.Icon icon="text-short" />}
                />
            </Card>

            <Text variant="titleMedium" style={{marginBottom: 10, fontWeight: 'bold'}}>Paragon (Opcjonalnie)</Text>
            <Card mode="outlined" style={{ marginBottom: 25, borderStyle: 'dashed', borderColor: theme.colors.outline }}>
                <Card.Content style={{ alignItems: 'center' }}>
                    {image ? (
                        <View style={{ alignItems: 'center' }}>
                            <Image source={{ uri: image.uri }} style={{ width: 200, height: 300, borderRadius: 10, marginBottom: 10 }} resizeMode="contain" />
                            <Button mode="text" onPress={() => setImage(null)} textColor={theme.colors.error}>Usuń zdjęcie</Button>
                        </View>
                    ) : (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                             <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                                <Button mode="contained-tonal" icon="camera" onPress={pickImage}>Aparat</Button>
                                <Button mode="outlined" icon="image" onPress={pickFromGallery}>Galeria</Button>
                             </View>
                             <Text variant="bodySmall" style={{ marginTop: 10, color: theme.colors.outline }}>Dodaj zdjęcie paragonu</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            <Button 
                mode="contained" 
                onPress={submitExpense} 
                loading={loading} 
                disabled={loading}
                style={{ borderRadius: 8 }}
                contentStyle={{ height: 50 }}
            >
                Zapisz Wydatek
            </Button>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}
