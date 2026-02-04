import React from 'react';
import { View, Linking, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme, Avatar, Divider } from 'react-native-paper';

export default function HotelScreen({ route }) {
  const { trip } = route.params;
  const theme = useTheme();

  // Backend should populate trip.hotel (from accommodations[0].hotel) or we fallback
  const hotel = trip.hotel || (trip.accommodations && trip.accommodations.length > 0 ? trip.accommodations[0].hotel : null);
  
  const hotelName = hotel?.name || "Brak informacji o hotelu";
  const hotelAddress = hotel?.address || (trip.destination?.name ? `Centrum, ${trip.destination.name}` : "Adres nieznany");
  const hotelImage = hotel?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
  
  const checkIn = trip.accommodations && trip.accommodations.length > 0 ? new Date(trip.accommodations[0].checkIn).toLocaleDateString() : trip.startDate;
  const checkOut = trip.accommodations && trip.accommodations.length > 0 ? new Date(trip.accommodations[0].checkOut).toLocaleDateString() : trip.endDate;


  const openMaps = () => {
    const query = hotelAddress !== "Adres nieznany" ? hotelAddress : hotelName;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 20 }}>
      {hotel ? (
          <Card mode="elevated" style={{ marginBottom: 20 }}>
            <Card.Cover source={{ uri: hotelImage }} />
            <Card.Title 
                title={hotelName} 
                subtitle={hotel?.stars ? `${hotel.stars}-gwiazdkowy` : "Hotel"} 
                titleVariant="headlineSmall"
                left={(props) => <Avatar.Icon {...props} icon="bed" />}
            />
            <Card.Content>
              <Text variant="bodyLarge" style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
                {hotelAddress}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained-tonal" icon="map-marker" onPress={openMaps}>Prowadź do hotelu</Button>
            </Card.Actions>
          </Card>
      ) : (
          <Card style={{ marginBottom: 20, backgroundColor: theme.colors.errorContainer }}>
              <Card.Title title="Brak rezerwacji" left={(props) => <Avatar.Icon {...props} icon="alert-circle" style={{backgroundColor: theme.colors.error}} />} />
              <Card.Content>
                  <Text>Nie znaleziono informacji o rezerwacji hotelowej dla tego wyjazdu.</Text>
              </Card.Content>
          </Card>
      )}
      
      <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 10 }}>Szczegóły pobytu</Text>
      <Card mode="outlined" style={{ marginBottom: 10 }}>
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Avatar.Icon size={40} icon="login" style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.onSecondaryContainer} />
              <View style={{ marginLeft: 15 }}>
                  <Text variant="labelMedium">Zameldowanie</Text>
                  <Text variant="titleLarge">{checkIn}</Text>
                  <Text variant="bodySmall">Od 14:00</Text>
              </View>
          </Card.Content>
      </Card>

      <Card mode="outlined">
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Avatar.Icon size={40} icon="logout" style={{ backgroundColor: theme.colors.tertiaryContainer }} color={theme.colors.onTertiaryContainer} />
              <View style={{ marginLeft: 15 }}>
                  <Text variant="labelMedium">Wymeldowanie</Text>
                  <Text variant="titleLarge">{checkOut}</Text>
                   <Text variant="bodySmall">Do 11:00</Text>
              </View>
          </Card.Content>
      </Card>

    </ScrollView>
  );
}
