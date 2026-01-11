import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
import api from '../services/api';

export default function ExpensesListScreen({ route, navigation }) {
    const { tripId } = route.params;
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = async () => {
        try {
            // Zakładamy endpoint GET /expenses?tripId=...
            // Dla demo mockujemy lub pobieramy wszystko
            // const res = await api.get(`/expenses?tripId=${tripId}`);
            // setExpenses(res.data);
            
            // MOCK
            setExpenses([
                { id: 1, description: 'Obiad', amount: 45.50, currency: 'PLN', date: '2023-10-10' },
                { id: 2, description: 'Taxi', amount: 20.00, currency: 'PLN', date: '2023-10-11' }
            ]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchExpenses();
        });
        return unsubscribe;
    }, [navigation]);

    if(loading) return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator/></View>;

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <FlatList
                data={expenses}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={{ marginBottom: 10 }}>
                        <Card.Title 
                            title={item.description} 
                            subtitle={item.date} 
                            right={(props) => <Text {...props} variant="titleMedium" style={{marginRight: 20}}>{item.amount} {item.currency}</Text>}
                        />
                    </Card>
                )}
                ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>Brak wydatków.</Text>}
            />
            <FAB
                icon="plus"
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 0,
                }}
                onPress={() => navigation.navigate('AddExpense', { tripId })}
            />
        </View>
    );
}
