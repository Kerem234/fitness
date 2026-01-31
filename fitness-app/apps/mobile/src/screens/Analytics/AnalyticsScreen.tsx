import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, Dimensions, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LineChart, BarChart } from 'react-native-chart-kit'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../../services/supabase'
import { GlassCard } from '../../components/ui/GlassCard'
import { theme } from '../../theme/designSystem'

const SCREEN_WIDTH = Dimensions.get('window').width

export const AnalyticsScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(true)
    const [calorieData, setCalorieData] = useState<any>(null)
    const [weightData, setWeightData] = useState<any>(null)

    useFocusEffect(
        useCallback(() => {
            fetchData()
        }, [])
    )

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Calories (Last 7 Days)
            const today = new Date()
            const labels = []
            const data = []

            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setDate(today.getDate() - i)
                const dateStr = d.toISOString().split('T')[0]
                labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))

                const { data: meals } = await supabase
                    .from('meals')
                    .select('total_calories')
                    .eq('user_id', user.id)
                    .eq('date', dateStr)

                const total = meals?.reduce((acc, m) => acc + m.total_calories, 0) || 0
                data.push(total)
            }

            setCalorieData({
                labels,
                datasets: [{ data }]
            })

            // 2. Weight History
            const { data: weights } = await supabase
                .from('weight_logs')
                .select('weight, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(10) // Last 10 points

            if (weights && weights.length > 0) {
                setWeightData({
                    labels: weights.map(w => new Date(w.created_at).getDate().toString()),
                    datasets: [{ data: weights.map(w => w.weight) }]
                })
            } else {
                setWeightData(null) // No data
            }

        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const chartConfig = {
        backgroundGradientFrom: "#18181B",
        backgroundGradientTo: "#18181B",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Primary Blue
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#3B82F6"
        }
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center bg-black">
                    <Text className="text-white text-2xl font-bold">Analytics</Text>
                    <View className="bg-gray-800 p-2 rounded-full">
                        <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
                    </View>
                </View>

                <ScrollView
                    className="flex-1 px-4 pt-4"
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="white" />}
                >
                    {/* Calorie Chart */}
                    <Text className="text-white font-bold text-lg mb-4 ml-2">Weekly Calories</Text>
                    {calorieData && (
                        <GlassCard style={{ padding: 0, paddingBottom: 16 }}>
                            <BarChart
                                data={calorieData}
                                width={SCREEN_WIDTH - 48}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    ...chartConfig,
                                    barPercentage: 0.7,
                                }}
                                verticalLabelRotation={0}
                                fromZero
                                style={{
                                    borderRadius: 16
                                }}
                            />
                        </GlassCard>
                    )}

                    {/* Weight Chart */}
                    <Text className="text-white font-bold text-lg mb-4 ml-2 mt-4">Weight Progress</Text>
                    {weightData ? (
                        <GlassCard style={{ padding: 0 }}>
                            <LineChart
                                data={weightData}
                                width={SCREEN_WIDTH - 48}
                                height={220}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
                                }}
                                bezier
                                style={{
                                    borderRadius: 16
                                }}
                            />
                        </GlassCard>
                    ) : (
                        <GlassCard style={{ padding: 24, alignItems: 'center' }}>
                            <Text className="text-gray-400">No weight logs yet.</Text>
                            <Text className="text-gray-500 text-xs mt-2">Log your weight in Profile to see trends.</Text>
                        </GlassCard>
                    )}

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
