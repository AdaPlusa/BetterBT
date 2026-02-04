import React from 'react';
import { View, FlatList } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';

const NOTIFICATIONS = [
    { id: '1', title: 'Przypomnienie', message: 'Pamiętaj o rozliczeniu delegacji do Warszawy.', date: 'Dzisiaj, 10:00', icon: 'clock' },
    { id: '2', title: 'Nowy status', message: 'Twój wniosek o wyjazd został zaakceptowany.', date: 'Wczoraj, 14:30', icon: 'check' },
    { id: '3', title: 'System', message: 'Zaplanowana przerwa techniczna w weekend.', date: '2 dni temu', icon: 'alert' },
];

export default function NotificationsScreen() {
    return (
        <View style={{ flex: 1, padding: 10 }}>
            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Card style={{ marginBottom: 10 }}>
                        <Card.Title
                            title={item.title}
                            subtitle={item.date}
                            left={(props) => <Avatar.Icon {...props} icon={item.icon} size={40} />}
                        />
                        <Card.Content>
                            <Text variant="bodyMedium">{item.message}</Text>
                        </Card.Content>
                    </Card>
                )}
            />
        </View>
    );
}
