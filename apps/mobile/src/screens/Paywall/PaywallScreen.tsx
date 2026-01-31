import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { getPackages, purchasePackage } from '../../services/revenuecat'
import { PurchasesPackage } from 'react-native-purchases'

export const PaywallScreen = ({ navigation }: any) => {
    const [packages, setPackages] = useState<PurchasesPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null)

    useEffect(() => {
        // In a real app, you would fetch from RevenueCat here.
        // implementing a mock for UI demonstration since we don't have real keys yet.
        const mockPackages: any[] = [
            {
                identifier: '$rc_annual',
                product: {
                    priceString: '$59.99',
                    title: 'Annual Plan',
                    description: '12 months access',
                },
                packageType: 'ANNUAL'
            },
            {
                identifier: '$rc_monthly',
                product: {
                    priceString: '$9.99',
                    title: 'Monthly Plan',
                    description: '1 month access',
                },
                packageType: 'MONTHLY'
            }
        ]
        setPackages(mockPackages)
        setSelectedPackage(mockPackages[0])
        setLoading(false)

        // Uncomment when real keys are added
        /*
        getPackages().then(pkgs => {
          setPackages(pkgs)
          if(pkgs.length > 0) setSelectedPackage(pkgs[0])
          setLoading(false)
        })
        */
    }, [])

    const handlePurchase = async () => {
        if (!selectedPackage) return
        setLoading(true)

        // Simulate purchase for now
        setTimeout(() => {
            setLoading(false)
            Alert.alert("Success", "Welcome to Pro!", [
                { text: "OK", onPress: () => navigation.replace('Main') }
            ])
        }, 1500)

        /*
        const success = await purchasePackage(selectedPackage)
        if (success) {
          navigation.replace('Main')
        } else {
          setLoading(false)
        }
        */
    }

    const handleRestore = () => {
        Alert.alert("Restore", "Restoring purchases...")
    }

    const features = [
        "Unlimited AI Meal Analysis",
        "Personalized Workout Plans",
        "Advanced Macro Tracking",
        "Ad-Free Experience"
    ]

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <LinearGradient
                colors={['#000000', '#1a1a1a']}
                className="absolute w-full h-full"
            />

            <SafeAreaView className="flex-1">
                <ScrollView className="flex-1 px-6">
                    <View className="items-center mt-8 mb-8">
                        <View className="w-24 h-24 bg-primary/20 rounded-full justify-center items-center mb-4 border border-primary shadow-lg shadow-primary/50">
                            <Ionicons name="diamond" size={48} color="#007AFF" />
                        </View>
                        <Text className="text-3xl font-bold text-white text-center">Unlock Pro Access</Text>
                        <Text className="text-gray-400 text-center mt-2 px-8">
                            Get the full AI coach experience and reach your goals faster.
                        </Text>
                    </View>

                    <View className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800 mb-8">
                        {features.map((feature, index) => (
                            <View key={index} className="flex-row items-center mb-4 last:mb-0">
                                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                                <Text className="text-white text-lg ml-3">{feature}</Text>
                            </View>
                        ))}
                    </View>

                    <View className="space-y-4 mb-8">
                        {packages.map((pkg) => (
                            <TouchableOpacity
                                key={pkg.identifier}
                                onPress={() => setSelectedPackage(pkg)}
                                className={`p-4 rounded-xl border flex-row justify-between items-center ${selectedPackage?.identifier === pkg.identifier
                                        ? 'bg-primary/20 border-primary'
                                        : 'bg-gray-900 border-gray-800'
                                    }`}
                            >
                                <View>
                                    <Text className="text-white font-bold text-lg">
                                        {pkg.packageType === 'ANNUAL' ? 'Yearly' : 'Monthly'}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        {pkg.packageType === 'ANNUAL' ? 'Best Value' : 'Standard'}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-white font-bold text-xl">{pkg.product.priceString}</Text>
                                    {pkg.packageType === 'ANNUAL' && (
                                        <Text className="text-primary text-xs font-bold">SAVE 50%</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-center text-gray-500 text-xs mb-4">
                        Recurring billing. Cancel anytime.
                    </Text>

                    <TouchableOpacity
                        onPress={handlePurchase}
                        disabled={loading}
                        className="w-full"
                    >
                        <LinearGradient
                            colors={['#007AFF', '#0055FF']}
                            className="py-4 rounded-2xl items-center shadow-lg"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Start 7-Day Free Trial</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.replace('Main')} className="mt-4 py-2">
                        <Text className="text-gray-500 text-center font-bold">Maybe Later</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleRestore} className="mt-2 mb-8">
                        <Text className="text-gray-600 text-center text-xs">Restore Purchases</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
