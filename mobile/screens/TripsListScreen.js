import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import api from '../services/api';

export default function TripsListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/my-trips');
      setTrips(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Odświeżaj listę za każdym razem gdy wchodzimy na ekran
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTrips();
    });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TripDetails', { id: item.id })}>
      <Card style={{ marginBottom: 10, marginHorizontal: 16, marginTop: 6 }} mode="elevated">
        <Card.Title 
            title={item.trip_name || item.destination?.name || item.destination_city} 
            subtitle={`${item.start_date} - ${item.end_date}`} 
            left={(props) => <Text {...props} variant="titleLarge">✈️</Text>}
        />
        <Card.Content>
           <Text>Status: {item.status?.name || item.status}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator /></View>;
  }

  return (
    <View style={{ flex: 1, paddingTop: 10 }}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>Brak wyjazdów.</Text>}
      />
    </View>
  );
}
