import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Dimensions } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { fetchProductByBarcode } from '../../services/openfoodfacts';

export const BarcodeScannerScreen = ({ navigation, route }: any) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const { mealType } = route.params;

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: any) => {
        setScanned(true);
        const product = await fetchProductByBarcode(data);
        if (product) {
            // Navigate back with result, or to Add Meal screen pre-filled
            // For simplicity, let's alert and log directly? 
            // Better: Go to a "Confrim Food" modal.
            // We restart scan if user cancels.
            // Let's pass it back.

            // Simulating navigation to a confirmation
            alert(`Found: ${product.product_name} (${product.calories} kcal)`);
            navigation.goBack();
            // Ideally: navigation.navigate('AddFoodDetails', { food: product, mealType })
        } else {
            alert(`Product not found for barcode: ${data}`);
            setScanned(false);
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13"],
                }}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
});
