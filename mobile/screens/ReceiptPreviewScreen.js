import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

export default function ReceiptPreviewScreen({ route }) {
    // Pobieramy parametry, np. uri zdjęcia. 
    // Jeśli nie ma, dajemy placeholder.
    const { imageUri } = route.params || {};

    // Placeholder image jeśli brak
    const displayImage = imageUri ? { uri: imageUri } : { uri: 'https://via.placeholder.com/300?text=Paragon' };

    const [error, setError] = React.useState(false);

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.title}>Podgląd Paragonu</Text>
            <View style={styles.imageContainer}>
                {error ? (
                    <Text style={{color: 'red'}}>Nie udało się załadować zdjęcia.</Text>
                ) : (
                    <Image 
                        source={displayImage} 
                        style={styles.image}
                        resizeMode="contain"
                        onError={(e) => {
                            console.log("Image Load Error:", e.nativeEvent.error);
                            setError(true);
                        }}
                    />
                )}
            </View>
            {/* Debugging info - remove in production */}
            <Text style={styles.debugText}>URL: {imageUri || 'Brak URI'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a', // Lighter black
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        position: 'absolute',
        top: 60, // Move down for safe area
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 5
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: '100%',
        height: '80%', // Not full screen to leave room for debug text
    },
    debugText: {
        color: 'gray',
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 10,
        fontSize: 10
    }
});
