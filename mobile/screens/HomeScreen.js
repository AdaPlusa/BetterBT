import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [nearestTrip, setNearestTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/my-trips');
        // Znajdz najblizszy (uproszczone: bierzemy pierwszy z listy)
        if (res.data && res.data.length > 0) {
            setNearestTrip(res.data[0]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    
    // Odświeżaj przy powrocie na ekran
    const unsubscribe = navigation.addListener('focus', () => {
        fetchTrips();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
      return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator /></View>;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>Cześć!</Text>

      {nearestTrip ? (
          <Card mode="elevated" style={{ marginBottom: 20 }}>
              <Card.Title title="Twój najbliższy wyjazd" subtitle={nearestTrip.status?.name || nearestTrip.status}/>
              <Card.Content>
                  <Text variant="titleLarge">{nearestTrip.destination?.name || nearestTrip.destination_city}</Text>
                  <Text>{nearestTrip.start_date} - {nearestTrip.end_date}</Text>
              </Card.Content>
              <Card.Actions>
                  <Button onPress={() => navigation.navigate('TripDetails', { id: nearestTrip.id })}>Szczegóły</Button>
              </Card.Actions>
          </Card>
      ) : (
          <Card style={{ marginBottom: 20, padding: 20 }}>
              <Text>Brak nadchodzących wyjazdów.</Text>
          </Card>
      )}

      <Text variant="titleMedium" style={{ marginBottom: 10 }}>Szybkie akcje</Text>
      <Button 
        mode="contained" 
        icon="plus" 
        onPress={() => {
            if(nearestTrip) {
                navigation.navigate('AddExpense', { tripId: nearestTrip.id });
            } else {
                // Jesli nie ma wyjazdu, mozna przekierowac do listy
                navigation.navigate('Trips'); 
            }
        }}
      >
        Dodaj Wydatek (Szybko)
      </Button>
    </View>
  );
}
