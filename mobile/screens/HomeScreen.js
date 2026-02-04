import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Card, ActivityIndicator, IconButton, Avatar, useTheme, Badge } from 'react-native-paper';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [nearestTrip, setNearestTrip] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  // Custom Header Effect
  React.useLayoutEffect(() => {
     navigation.setOptions({
       headerRight: () => (
         <View style={{ marginRight: 10 }}>
            <IconButton 
                icon="bell-ring" 
                iconColor={theme.colors.onPrimary}
                size={28}
                onPress={() => navigation.navigate('Notifications')} 
            />
            {/* Hardcoded badge for effect */}
            <Badge size={16} style={{ position: 'absolute', top: 4, right: 4 }}>3</Badge>
         </View>
       ),
       headerTitle: "", // Hide default title to clean up
       headerStyle: { backgroundColor: theme.colors.primary, elevation: 0, shadowOpacity: 0 }, // Flat header
     });
   }, [navigation, theme]);

  // Helper do bezpiecznego formatowania daty
  const formatDate = (dateStr) => {
      if(!dateStr) return '—';
      try {
          const d = new Date(dateStr);
          if(isNaN(d.getTime())) return '—';
          return d.toLocaleDateString();
      } catch(e) { return '—'; }
  };

  const fetchData = async () => {
    try {
        // 1. Get User Info
        try {
            const userRes = await api.get('/auth/me');
            if(userRes.data) {
                setUserName(userRes.data.firstName || userRes.data.email?.split('@')[0] || 'Użytkowniku');
            }
        } catch(e) {
            console.log("Error fetching user", e);
        }

        // 2. Get Trips
        const tripsRes = await api.get('/my-trips');
        
        if (tripsRes.data && Array.isArray(tripsRes.data)) {
            const now = new Date();
            const upcomingTrips = tripsRes.data
                .filter(t => {
                   // Safe check for end date
                   const endStr = t.end_date || t.endDate;
                   if(!endStr) return false;
                   const d = new Date(endStr);
                   if(isNaN(d.getTime())) return false; // Invalid date
                   return d >= now;
                })
                .sort((a, b) => {
                    const d1 = new Date(a.start_date || a.startDate || 0);
                    const d2 = new Date(b.start_date || b.startDate || 0);
                    return d1 - d2;
                });

            if (upcomingTrips.length > 0) {
                setNearestTrip(upcomingTrips[0]);
            } else {
                setNearestTrip(null);
            }
        } else {
             setNearestTrip(null);
        }

    } catch (error) {
      console.log("Error details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      fetchData();
  };

  useEffect(() => {
    fetchData();
    // Odświeżaj przy powrocie
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  if (loading && !refreshing) {
      return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: theme.colors.background }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hello Header */}
      <View style={{ marginBottom: 30, marginTop: 10 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Cześć, {userName}!</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>Miłego dnia w pracy.</Text>
      </View>

      {/* Nearest Trip Card */}
      <Text variant="titleMedium" style={{ marginBottom: 15, fontWeight: 'bold' }}>Twój najbliższy wyjazd</Text>
      
      {nearestTrip ? (
          <Card mode="elevated" style={{ marginBottom: 25, backgroundColor: theme.colors.surface }}>
              {/* Image placeholder or generic travel image */}
              <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }} />
              <Card.Title 
                title={nearestTrip.destination?.name || nearestTrip.destination_city || "Nieznane miasto"} 
                titleVariant="headlineSmall"
                subtitle={nearestTrip.status?.name || "Status nieznany"}
                subtitleStyle={{ color: nearestTrip.status?.name === 'Zatwierdzona' ? 'green' : theme.colors.secondary }}
                right={(props) => <IconButton {...props} icon="chevron-right" onPress={() => navigation.navigate('TripDetails', { id: nearestTrip.id })} />}
              />
              <Card.Content>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <Avatar.Icon size={24} icon="calendar" style={{ backgroundColor: 'transparent' }} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                        {formatDate(nearestTrip.start_date || nearestTrip.startDate)} - {formatDate(nearestTrip.end_date || nearestTrip.endDate)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                     <Avatar.Icon size={24} icon="map-marker-distance" style={{ backgroundColor: 'transparent' }} color={theme.colors.primary} />
                     <Text variant="bodyMedium" style={{ marginLeft: 8 }}>{nearestTrip.purpose || "Brak celu"}</Text>
                  </View>
              </Card.Content>
              <Card.Actions style={{justifyContent: 'flex-end', paddingTop: 10}}>
                  <Button mode="outlined" onPress={() => navigation.navigate('TripDetails', { id: nearestTrip.id })}>Szczegóły</Button>
              </Card.Actions>
          </Card>
      ) : (
          <Card style={{ marginBottom: 25, backgroundColor: theme.colors.surfaceVariant }}>
              <Card.Content style={{ alignItems: 'center', padding: 20 }}>
                  <Avatar.Icon icon="airplane-off" size={60} style={{ backgroundColor: 'transparent', marginBottom: 10 }} color={theme.colors.outline} />
                  <Text variant="titleMedium" style={{ color: theme.colors.outline }}>Brak nadchodzących wyjazdów.</Text>
                  <Button mode="text" onPress={() => navigation.navigate('Trips')} style={{ marginTop: 10 }}>Sprawdź historię</Button>
              </Card.Content>
          </Card>
      )}

      {/* Quick Actions */}
      <Text variant="titleMedium" style={{ marginBottom: 15, fontWeight: 'bold' }}>Szybkie akcje</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Card style={{ flex: 1, marginRight: 10 }} onPress={() => {
                if(nearestTrip) navigation.navigate('AddExpense', { tripId: nearestTrip.id });
                else navigation.navigate('Trips');
          }}>
              <Card.Content style={{ alignItems: 'center', padding: 15 }}>
                  <Avatar.Icon icon="receipt" size={40} style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer} />
                  <Text style={{ marginTop: 10, textAlign: 'center', fontWeight: 'bold' }} variant="labelLarge">Dodaj Wydatek</Text>
              </Card.Content>
          </Card>

          <Card style={{ flex: 1, marginLeft: 10 }} onPress={() => navigation.navigate('Notifications')}>
              <Card.Content style={{ alignItems: 'center', padding: 15 }}>
                  <Avatar.Icon icon="bell-outline" size={40} style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.onSecondaryContainer} />
                   <Text style={{ marginTop: 10, textAlign: 'center', fontWeight: 'bold' }} variant="labelLarge">Komunikaty</Text>
              </Card.Content>
          </Card>
      </View>

    </ScrollView>
  );
}
