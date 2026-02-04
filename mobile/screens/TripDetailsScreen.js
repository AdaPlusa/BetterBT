import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, ActivityIndicator, Avatar, useTheme } from 'react-native-paper';
import api from '../services/api';

export default function TripDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchTrip = async () => {
        try {
            const res = await api.get(`/trips/${id}`);
            setTrip(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchTrip();
  }, [id]);

  const formatDate = (dateStr) => {
      if(!dateStr) return '—';
      try {
          return new Date(dateStr).toLocaleDateString();
      } catch(e) { return dateStr; }
  };

  if (loading) return <View style={{flex:1, justifyContent:'center', alignItems: 'center'}}><ActivityIndicator size="large" /></View>;
  if (!trip) return <View style={{flex:1, justifyContent:'center'}}><Text style={{textAlign:'center'}}>Nie znaleziono wyjazdu.</Text></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary, marginTop: 10 }}>
              {trip.destination?.name || trip.destination_city || "Nieznane"}
          </Text>
           <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>
              {trip.status?.name || "Status nieznany"}
          </Text>

          <Divider style={{ marginVertical: 15 }} />

          {/* Info Section */}
          <View style={{ marginBottom: 20 }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Avatar.Icon size={36} icon="calendar" style={{ backgroundColor: 'transparent' }} color={theme.colors.primary} />
                    <View style={{ marginLeft: 10 }}>
                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Termin</Text>
                        <Text variant="bodyLarge">{formatDate(trip.startDate || trip.start_date)} - {formatDate(trip.endDate || trip.end_date)}</Text>
                    </View>
               </View>

               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Avatar.Icon size={36} icon="bullseye-arrow" style={{ backgroundColor: 'transparent' }} color={theme.colors.primary} />
                    <View style={{ marginLeft: 10 }}>
                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Cel</Text>
                        <Text variant="bodyLarge">{trip.purpose || trip.description || "Brak opisu"}</Text>
                    </View>
               </View>
               
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Icon size={36} icon="map-marker" style={{ backgroundColor: 'transparent' }} color={theme.colors.primary} />
                    <View style={{ marginLeft: 10 }}>
                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Kraj</Text>
                        <Text variant="bodyLarge">{trip.destination?.country?.name || trip.destination_country || "Polska"}</Text>
                    </View>
               </View>
          </View>

          {/* Actions */}
          <Text variant="titleMedium" style={{ marginBottom: 10, fontWeight: 'bold' }}>Akcje</Text>

          <Button 
            mode="contained" 
            icon="ticket-confirmation" 
            onPress={() => navigation.navigate('Ticket', { trip })}
            style={{ marginBottom: 10 }}
            contentStyle={{ height: 50 }}
          >
            Bilet i Transport
          </Button>

          <Button 
            mode="outlined" 
            icon="bed" 
            onPress={() => navigation.navigate('Hotel', { trip })}
            style={{ marginBottom: 10 }}
            contentStyle={{ height: 50 }}
          >
            Hotel i Zakwaterowanie
          </Button>
          
          <Button 
            mode="outlined" 
            icon="cash-multiple" 
            onPress={() => navigation.navigate('ExpensesList', { tripId: trip.id })}
            style={{ marginBottom: 10 }}
             contentStyle={{ height: 50 }}
          >
            Lista Wydatków
          </Button>

          <Button 
            mode="elevated" 
            icon="plus-circle" 
            buttonColor={theme.colors.secondaryContainer}
            textColor={theme.colors.onSecondaryContainer}
            onPress={() => navigation.navigate('AddExpense', { tripId: trip.id })}
             contentStyle={{ height: 50 }}
          >
            Dodaj Nowy Wydatek
          </Button>
      </View>
    </ScrollView>
  );
}
