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
                    title="Twój Manager" 
                    subtitle="Jan Kowalski" 
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
                    <Button icon="email" mode="outlined" onPress={() => sendEmail('it@firma.pl')} style={{ marginBottom: 10 }}>
                        Napisz: it@firma.pl
                    </Button>
                    <Button icon="phone" mode="outlined" onPress={() => callPhone('987654321')}>
                        Zadzwoń: 987 654 321
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
}
