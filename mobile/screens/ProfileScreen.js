import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Avatar, List, Card, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                 const res = await api.get('/auth/me');
                 setUser(res.data);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUser();
        });
        return unsubscribe;
    }, [navigation]);

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
        } catch(e) {
            console.error("Logout error:", e);
        }
    };

    if (loading) {
        return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator /></View>;
    }

    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';
    const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Użytkownik' : 'Użytkownik';
    const roleName = user?.role?.name || (user?.roleId === 1 ? 'Administrator' : 'Pracownik');

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: theme.colors.surfaceVariant }}>
                <Avatar.Text 
                    size={100} 
                    label={initials} 
                    style={{ marginBottom: 15, backgroundColor: theme.colors.primary }} 
                    color={theme.colors.onPrimary}
                />
                <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>{fullName}</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>{user?.email}</Text>
                <View style={{ marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.colors.secondaryContainer }}>
                    <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer }}>{roleName.toUpperCase()}</Text>
                </View>
            </View>

            <View style={{ padding: 20 }}>
                <Text variant="titleMedium" style={{ marginBottom: 10, marginTop: 10, fontWeight: 'bold', color: theme.colors.primary }}>Ustawienia Konta</Text>
                
                <Card mode="elevated" style={{ backgroundColor: theme.colors.surface }}>
                    <List.Section>
                        <List.Item 
                            title="Ustawienia Aplikacji" 
                            left={props => <List.Icon {...props} icon="cog" />} 
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('ServerSettings')}
                        />
                    </List.Section>
                </Card>

                <Text variant="titleMedium" style={{ marginBottom: 10, marginTop: 25, fontWeight: 'bold', color: theme.colors.primary }}>Pomoc</Text>
                 <Card mode="elevated" style={{ backgroundColor: theme.colors.surface }}>
                    <List.Section>
                         <List.Item 
                            title="Wsparcie / Kontakt" 
                            description="Masz problem? Napisz do nas."
                            left={props => <List.Icon {...props} icon="face-agent" />} 
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('Contact')}
                        />
                    </List.Section>
                 </Card>

                <Button 
                    mode="contained" 
                    onPress={logout} 
                    style={{ marginTop: 40, borderRadius: 8 }} 
                    buttonColor={theme.colors.error}
                    icon="logout"
                    contentStyle={{ height: 50 }}
                >
                    Wyloguj się
                </Button>
                
                <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 30, color: theme.colors.outline }}>Better BT v1.0.2</Text>
            </View>
        </ScrollView>
    );
}
