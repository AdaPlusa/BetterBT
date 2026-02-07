import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, Chip, Avatar } from 'react-native-paper';
import api from '../services/api';

export default function TripsListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const fetchTrips = async () => {
    try {
      const res = await api.get('/my-trips');

      
      // Sort by startDate descending (newest first)
      const sortedTrips = res.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setTrips(sortedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTrips();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  const getStatusColor = (statusName) => {
      switch(statusName) {
          case 'Zatwierdzona': return theme.colors.primary; 
          case 'Odrzucona': return theme.colors.error;
          case 'Nowa': return theme.colors.secondary;
          case 'W trakcie': return theme.colors.tertiary; // Add 'W trakcie'
          case 'Rozliczona': return 'green';
          default: return theme.colors.outline;
      }
  };

  const formatDate = (dateStr) => {
      if(!dateStr) return 'Brak daty';
      try {
          return new Date(dateStr).toLocaleDateString();
      } catch(e) { return 'Błąd daty'; }
  };

  const renderItem = ({ item }) => {
     // Use strictly camelCase as per Prisma schema
     const statusName = item.status?.name || "Nieznany";
     const statusColor = getStatusColor(statusName);
     
     // Correct field names: startDate, endDate, destination.name
     const cityName = item.destination?.name || "Nieznane miasto";
     
     return (
        <TouchableOpacity onPress={() => navigation.navigate('TripDetails', { id: item.id })} activeOpacity={0.8}>
          <Card style={{ marginBottom: 12, marginHorizontal: 16, backgroundColor: theme.colors.surface }} mode="elevated">
            <Card.Content style={{ paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{cityName}</Text>
                    <Chip 
                        icon="information" 
                        mode="outlined" 
                        textStyle={{ color: statusColor }}
                        style={{ borderColor: statusColor }}
                        compact
                    >
                        {statusName}
                    </Chip>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <Avatar.Icon size={24} icon="calendar-range" style={{ backgroundColor: 'transparent' }} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodyMedium" style={{ marginLeft: 5, color: theme.colors.onSurfaceVariant }}>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </Text>
                </View>

                {item.purpose && (
                    <Text variant="bodySmall" style={{ marginTop: 8, fontStyle: 'italic', color: theme.colors.outline }}>
                        "{item.purpose}"
                    </Text>
                )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
  };

  if (loading && !refreshing) {
    return <View style={{flex:1, justifyContent:'center', alignItems: 'center'}}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text variant="headlineSmall" style={{ padding: 16, paddingBottom: 0, fontWeight: 'bold', color: theme.colors.primary }}>Moje Delegacje</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Avatar.Icon icon="airplane-off" size={60} style={{ backgroundColor: theme.colors.surfaceVariant }} color={theme.colors.outline} />
                <Text style={{ textAlign: 'center', marginTop: 15, color: theme.colors.outline, fontSize: 16 }}>Brak zaplanowanych wyjazdów.</Text>
            </View>
        }
      />
    </View>
  );
}
