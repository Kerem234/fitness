import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, Alert } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { fetchProductByBarcode } from '../../services/openfoodfacts';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { theme } from '../../theme/designSystem';
import { SafeAreaView } from 'react-native-safe-area-context';

export const BarcodeScannerScreen = ({ navigation, route }: any) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    // Safety check for route params
    const mealType = route?.params?.mealType || 'snack';

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };
        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: any) => {
        setScanned(true);
        // Add haptic feedback here if desired
        try {
            const product = await fetchProductByBarcode(data);
            if (product) {
                Alert.alert(
                    "Product Found",
                    `${product.product_name}\n${product.calories} kcal`,
                    [
                        { text: "Cancel", onPress: () => setScanned(false), style: "cancel" },
                        {
                            text: "Log It", onPress: () => {
                                // Log logic would go here
                                // logMeal(...)
                                Alert.alert("Logged!", "Added to your diary.")
                                navigation.goBack();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Not Found", `Barcode ${data} not in database.`, [
                    { text: "OK", onPress: () => setScanned(false) }
                ]);
            }
        } catch (e) {
            setScanned(false);
        }
    };

    if (hasPermission === null) {
        return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">Requesting camera...</Text></View>;
    }
    if (hasPermission === false) {
        return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">No access to camera</Text></View>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13", "upc_e", "upc_a"],
                }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Overlay */}
            <SafeAreaView className="flex-1 justify-between p-6">
                <View className="flex-row justify-between items-center">
                    <PremiumButton
                        title=""
                        icon="arrow-back"
                        variant="secondary"
                        style={{ width: 50, height: 50, borderRadius: 25, paddingVertical: 0 }}
                        onPress={() => navigation.goBack()}
                    />
                    <GlassCard style={{ padding: 8, borderRadius: 12 }}>
                        <Text className="text-white font-bold">Scan Barcode</Text>
                    </GlassCard>
                    <View style={{ width: 50 }} />
                </View>

                {/* Scan Frame Visual */}
                <View className="items-center justify-center flex-1">
                    <View style={{ width: 280, height: 280, borderWidth: 2, borderColor: theme.colors.primary, borderRadius: 20, opacity: 0.8 }}>
                        <View style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: theme.colors.primary }} />
                        <View style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTopWidth: 4, borderRightWidth: 4, borderColor: theme.colors.primary }} />
                        <View style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: theme.colors.primary }} />
                        <View style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: theme.colors.primary }} />
                    </View>
                    <Text className="text-white text-center mt-4 bg-black/50 px-4 py-2 rounded-full overflow-hidden">
                        Align code within frame
                    </Text>
                </View>

                {scanned && (
                    <View className="absolute bottom-10 left-6 right-6">
                        <PremiumButton title="Scan Again" onPress={() => setScanned(false)} />
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});
