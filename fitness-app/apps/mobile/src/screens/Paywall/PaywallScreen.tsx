import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { PurchasesPackage } from 'react-native-purchases'
import { LinearGradient } from 'expo-linear-gradient'

import { getPackages, purchasePackage, checkProStatus } from '../../services/revenuecat'
import { GlassCard } from '../../components/ui/GlassCard'
import { PremiumButton } from '../../components/ui/PremiumButton'
import { theme } from '../../theme/designSystem'

export const PaywallScreen = ({ navigation }: any) => {
    const [packages, setPackages] = useState<PurchasesPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null)

    useEffect(() => {
        loadOfferings()
    }, [])

    const loadOfferings = async () => {
        setLoading(true)
        // Mock for demonstration if no real packages found
        const mockPackages: any[] = [
            {
                identifier: '$rc_annual',
                product: { priceString: '$59.99', title: 'Annual', description: '12 months access' },
                packageType: 'ANNUAL'
            },
            {
                identifier: '$rc_monthly',
                product: { priceString: '$9.99', title: 'Monthly', description: '1 month access' },
                packageType: 'MONTHLY'
            }
        ]

        try {
            const realPackages = await getPackages()
            if (realPackages.length > 0) {
                setPackages(realPackages)
                setSelectedPkg(realPackages[0])
            } else {
                setPackages(mockPackages)
                setSelectedPkg(mockPackages[0])
            }
        } catch (e) {
            setPackages(mockPackages)
            setSelectedPkg(mockPackages[0])
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        if (!selectedPkg) return
        setLoading(true)

        // Simulating purchase for Demo
        const isDemo = true
        if (isDemo) {
            setTimeout(() => {
                setLoading(false)
                Alert.alert("Welcome to Pro!", "You now have unlimited access.", [
                    { text: "Let's Go", onPress: () => navigation.popToTop() }
                ])
            }, 1000)
            return
        }

        const success = await purchasePackage(selectedPkg)
        setLoading(false)
        if (success) {
            Alert.alert("Success", "Welcome to Pro!")
            navigation.popToTop()
        }
    }

    const handleRestore = async () => {
        setLoading(true)
        const isPro = await checkProStatus()
        setLoading(false)
        if (isPro) {
            Alert.alert("Restored", "Your Pro access is active.")
            navigation.popToTop()
        } else {
            Alert.alert("No Purchases", "We couldn't find any active subscriptions.")
        }
    }

    const features = [
        { icon: "nutrition", text: "Unlimited AI Food Scan" },
        { icon: "barbell", text: "Advanced Workout Plans" },
        { icon: "chatbubbles", text: "Chat with AI Coach 24/7" },
        { icon: "stats-chart", text: "Detailed Analytics" },
    ]

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            {/* Background Gradient */}
            <LinearGradient
                colors={[theme.colors.primaryDark, 'black']}
                start={{ x: 0.5, y: -0.2 }}
                end={{ x: 0.5, y: 0.6 }}
                style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.4 }}
            />

            <SafeAreaView className="flex-1">
                <View className="items-end px-4">
                    <Ionicons name="close-circle" size={32} color="gray" onPress={() => navigation.goBack()} />
                </View>

                <ScrollView className="flex-1 px-6">
                    <View className="items-center mb-8 mt-4">
                        <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-6 shadow-lg shadow-primary">
                            <Ionicons name="diamond" size={48} color={theme.colors.primary} />
                        </View>
                        <Text className="text-white text-3xl font-bold text-center">Unlock Premium</Text>
                        <Text className="text-gray-400 text-center mt-2 px-8">
                            Supercharge your fitness journey with AI power.
                        </Text>
                    </View>

                    {/* Features List */}
                    <GlassCard className="mb-8">
                        {features.map((f, i) => (
                            <View key={i} className="flex-row items-center mb-4 last:mb-0">
                                <View className="bg-primary/20 p-2 rounded-full mr-4">
                                    <Ionicons name={f.icon as any} size={20} color={theme.colors.primary} />
                                </View>
                                <Text className="text-white font-bold text-base">{f.text}</Text>
                            </View>
                        ))}
                    </GlassCard>

                    {/* Packages */}
                    <View className="flex-row justify-between mb-8">
                        {packages.map((pkg) => {
                            const isSelected = selectedPkg?.identifier === pkg.identifier
                            return (
                                <GlassCard
                                    key={pkg.identifier}
                                    variant={isSelected ? 'primary' : 'dark'}
                                    style={{ width: '48%', padding: 16, borderWidth: 2, borderColor: isSelected ? theme.colors.primary : 'transparent' }}
                                    onTouchEnd={() => setSelectedPkg(pkg)}
                                >
                                    {pkg.packageType === 'ANNUAL' && (
                                        <View className="absolute -top-3 right-0 bg-yellow-500 px-2 py-0.5 rounded-full">
                                            <Text className="text-black text-[10px] font-bold">BEST VALUE</Text>
                                        </View>
                                    )}
                                    <Text className="text-gray-300 font-bold text-xs uppercase mb-1">{pkg.product.title.split(' ')[0]}</Text>
                                    <Text className="text-white font-extrabold text-xl">{pkg.product.priceString}</Text>
                                    <Text className="text-gray-400 text-[10px] mt-1">
                                        {pkg.packageType === 'ANNUAL' ? '/year' : '/month'}
                                    </Text>
                                </GlassCard>
                            )
                        })}
                    </View>

                    <Text className="text-xs text-gray-500 text-center mb-4">
                        Recurring billing. Cancel anytime in store settings.
                    </Text>

                    <PremiumButton
                        title={loading ? "Processing..." : "Start Free Trial"}
                        onPress={handlePurchase}
                        disabled={loading}
                        style={{ marginBottom: 16 }}
                    />

                    <View className="flex-row justify-center space-x-6 mb-8">
                        <Text className="text-gray-500 text-xs" onPress={handleRestore}>Restore Purchase</Text>
                        <Text className="text-gray-500 text-xs">Terms of Service</Text>
                        <Text className="text-gray-500 text-xs">Privacy Policy</Text>
                    </View>

                    <View className="h-10" />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
