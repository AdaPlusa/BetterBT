import React from 'react';
import { View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

export default function TicketScreen({ route }) {
  const { trip } = route.params;
  // Dane do QR kodu - np. ID biletu lub JSON
  const qrData = JSON.stringify({
    ticketId: 12345,
    passenger: "Jan Student",
    trip: trip.destination_city
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 30 }}>Bilet PKP / Lotniczy</Text>
      
      <Card style={{ padding: 20, alignItems: 'center', backgroundColor: 'white' }}>
        <QRCode value={qrData} size={200} />
      </Card>

      <Text style={{ marginTop: 30, textAlign: 'center' }}>
        Pokaż ten kod konduktorowi.
      </Text>
      <Text variant="bodySmall" style={{color: 'gray'}}>
        Relacja: Warszawa {'->'} {trip.destination_city}
      </Text>
    </View>
  );
}
