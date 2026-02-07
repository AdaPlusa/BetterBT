import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, FAB, Avatar, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ExpensesListScreen({ route, navigation }) {
    const { tripId } = route.params;
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverUrl, setServerUrl] = useState('http://10.0.2.2:3000'); // Default fallback
    const theme = useTheme();

    useEffect(() => {
        const getUrl = async () => {
            try {
                const ip = await AsyncStorage.getItem('serverIp');
                if (ip) {
                    setServerUrl(`http://${ip}:3000`);
                }
            } catch (e) { }
        };
        getUrl();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchExpenses();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchExpenses = async () => {
        try {
            const res = await api.get(`/trips/${tripId}`);
            if (res.data && res.data.expenseReport && res.data.expenseReport.items) {
                setExpenses(res.data.expenseReport.items);
            } else {
                setExpenses([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if(loading) return <View style={{flex:1, justifyContent:'center', alignItems: 'center'}}><ActivityIndicator size="large" /></View>;

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <FlatList
                contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
                data={expenses}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Card 
                        style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                        mode="elevated"
                        onPress={() => {
                            if (item.receipt && item.receipt.fileUrl) {
                                // Use the dynamic serverUrl
                                const fullUrl = `${serverUrl}${item.receipt.fileUrl}`;
                                navigation.navigate('ReceiptPreview', { imageUri: fullUrl });
                            }
                        }}
                    >
                        <Card.Title 
                            title={item.description} 
                            subtitle={new Date(item.date).toLocaleDateString()}
                            titleStyle={{ fontWeight: 'bold' }}
                            left={(props) => <Avatar.Icon {...props} icon="receipt" size={40} style={{backgroundColor: theme.colors.secondaryContainer}} color={theme.colors.onSecondaryContainer} />}
                            right={(props) => <Text {...props} variant="titleMedium" style={{marginRight: 20, fontWeight: 'bold', color: theme.colors.primary}}>{item.amount} PLN</Text>}
                        />
                    </Card>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Avatar.Icon icon="cash-remove" size={60} style={{ backgroundColor: theme.colors.surfaceVariant }} color={theme.colors.outline} />
                        <Text style={{ textAlign: 'center', marginTop: 10, color: theme.colors.outline }}>Brak zapisanych wydatków.</Text>
                    </View>
                }
            />
            <FAB
                icon="plus"
                label="Dodaj"
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.colors.primaryContainer
                }}
                color={theme.colors.onPrimaryContainer}
                onPress={() => navigation.navigate('AddExpense', { tripId })}
            />
        </View>
    );
}
