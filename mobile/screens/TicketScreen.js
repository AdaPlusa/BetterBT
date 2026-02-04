import { View, ScrollView } from 'react-native';
import { Text, Card, Avatar, useTheme, Divider } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

export default function TicketScreen({ route }) {
  const { trip } = route.params;
  const theme = useTheme();

  // Extract transport info
  const transport = trip.transports && trip.transports.length > 0 ? trip.transports[0] : null;
  const providerName = transport?.provider?.name || "Brak danych";
  const typeName = transport?.type?.name || "Transport własny/inny";
  const cost = transport?.cost ? `${transport.cost} PLN` : "—";
  
  // Dane do QR kodu
  const qrData = JSON.stringify({
    tripId: trip.id,
    user: trip.user?.email || "User",
    destination: trip.destination?.name,
    validFrom: trip.start_date
  });

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: theme.colors.background }}>
      <Text variant="headlineSmall" style={{ marginBottom: 20, color: theme.colors.primary, fontWeight: 'bold' }}>Twój Bilet</Text>
      
      <Card style={{ padding: 20, alignItems: 'center', backgroundColor: 'white', marginBottom: 20, width: '100%' }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <QRCode value={qrData} size={200} />
            <Text variant="bodySmall" style={{ marginTop: 5, color: 'gray' }}>Zeskanuj u konduktora</Text>
        </View>
        
        <Divider style={{ width: '100%', marginBottom: 20 }} />

        <View style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <Avatar.Icon size={40} icon="train-car" style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.onSecondaryContainer} />
                <View style={{ marginLeft: 15 }}>
                     <Text variant="labelMedium" style={{color: 'gray'}}>Przewoźnik</Text>
                     <Text variant="titleMedium">{providerName}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <Avatar.Icon size={40} icon="shape" style={{ backgroundColor: theme.colors.tertiaryContainer }} color={theme.colors.onTertiaryContainer} />
                <View style={{ marginLeft: 15 }}>
                     <Text variant="labelMedium" style={{color: 'gray'}}>Typ</Text>
                     <Text variant="titleMedium">{typeName}</Text>
                </View>
            </View>

             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar.Icon size={40} icon="cash" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer} />
                <View style={{ marginLeft: 15 }}>
                     <Text variant="labelMedium" style={{color: 'gray'}}>Koszt</Text>
                     <Text variant="titleMedium">{cost}</Text>
                </View>
            </View>
        </View>
      </Card>

      <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 5 }}>
        {trip.destination?.name || trip.destination_city}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Data wyjazdu: {new Date(trip.start_date || trip.startDate).toLocaleDateString()}
      </Text>
    </ScrollView>
  );
}
