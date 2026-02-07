import React from 'react';
import { View, Linking } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';

export default function ContactScreen() {

    const callPhone = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const sendEmail = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text variant="headlineMedium" style={{ marginBottom: 20, textAlign: 'center' }}>Wsparcie i Kontakt</Text>

            <Card style={{ marginBottom: 20 }}>
                <Card.Title 
                    title="Twój Opiekun" 
                    subtitle="Marlena Morawska" 
                    left={(props) => <Avatar.Icon {...props} icon="account-tie" />}
                />
                <Card.Content>
                    <Text style={{ marginBottom: 10 }}>Jeśli masz pytania odnośnie akceptacji wniosków.</Text>
                    <Button icon="phone" mode="outlined" onPress={() => callPhone('123456789')}>
                        Zadzwoń: 123 456 789
                    </Button>
                </Card.Content>
            </Card>

            <Card>
                <Card.Title 
                    title="Wsparcie IT" 
                    subtitle="Helpdesk" 
                    left={(props) => <Avatar.Icon {...props} icon="laptop" />}
                />
                <Card.Content>
                    <Text style={{ marginBottom: 10 }}>Problemy z aplikacją lub logowaniem.</Text>
                    <Button icon="email" mode="outlined" onPress={() => sendEmail('it4you@betterbt.pl')} style={{ marginBottom: 10 }}>
                        Napisz: it4you@betterbt.pl
                    </Button>
                    <Button icon="phone" mode="outlined" onPress={() => callPhone('505050505')}>
                        Zadzwoń: 505 050 505
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
}
