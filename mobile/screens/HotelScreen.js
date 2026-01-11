import React from 'react';
import { View, Linking } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

export default function HotelScreen({ route }) {
  const { trip } = route.params;
  const hotelName = "Hotel Student Inn"; // Hardcoded for demo/student project
  const hotelAddress = "ul. Przykładowa 5, " + trip.destination_city;

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelAddress)}`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Card>
        <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
        <Card.Title title={hotelName} subtitle="★ ★ ★" />
        <Card.Content>
          <Text variant="bodyLarge" style={{ marginTop: 10 }}>
            Adres: {hotelAddress}
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button icon="map-marker" onPress={openMaps}>Prowadź do hotelu</Button>
        </Card.Actions>
      </Card>
      
      <Text style={{ marginTop: 20 }}>
        Zameldowanie: {trip.start_date}, 14:00
      </Text>
      <Text>
        Wymeldowanie: {trip.end_date}, 11:00
      </Text>
    </View>
  );
}
