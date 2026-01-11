import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import api from '../services/api';

export default function TripDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    // W prawdziwym app pobieramy szczegóły ID
    // api.get(`/trips/${id}`)...
    // Tutaj mockujemy lub szukamy w liście, ale uprośćmy:
    // Pobieramy całą listę i filtrujemy (dla demo wystarczy)
    api.get('/my-trips').then(res => {
        const found = res.data.find(t => t.id === id);
        setTrip(found);
    });
  }, [id]);

  if (!trip) return <View style={{flex:1, justifyContent:'center'}}><Text style={{textAlign:'center'}}>Ładowanie...</Text></View>;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 10 }}>{trip.trip_name || trip.destination?.name || trip.destination_city}</Text>
      <Text variant="titleMedium">Cel: {trip.description || trip.purpose}</Text>
      <Text variant="bodyLarge" style={{ marginTop: 10 }}>📅 {trip.start_date} - {trip.end_date}</Text>
      <Text variant="bodyLarge">📍 {trip.destination?.name || trip.destination_city}, {trip.destination_country || trip.destination?.country?.name}</Text>
      <Divider style={{ marginVertical: 20 }} />

      <Button 
        mode="contained" 
        icon="ticket-account" 
        onPress={() => navigation.navigate('Ticket', { trip })}
        style={{ marginBottom: 10 }}
      >
        Zobacz Bilet & QR
      </Button>

      <Button 
        mode="outlined" 
        icon="bed" 
        onPress={() => navigation.navigate('Hotel', { trip })}
        style={{ marginBottom: 10 }}
      >
        Informacje o Hotelu
      </Button>
      
      <Button 
        mode="outlined" 
        icon="cash-multiple" 
        onPress={() => navigation.navigate('ExpensesList', { tripId: trip.id })}
        style={{ marginBottom: 10 }}
      >
        Lista Wydatków
      </Button>

      <Button 
        mode="outlined" 
        icon="cash-plus" 
        onPress={() => navigation.navigate('AddExpense', { tripId: trip.id })}
      >
        Dodaj Wydatek
      </Button>
    </ScrollView>
  );
}
