import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, RefreshControl, Image, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'

import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { BentoGrid, BentoCard } from '../../components/magic/BentoGrid'
import { MagicButton } from '../../components/magic/MagicButton'
import { theme } from '../../theme/designSystem'

export const DashboardScreen = ({ navigation }: any) => {
    const { session } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [dailyStats, setDailyStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
    const [targetCalories, setTargetCalories] = useState(2500)

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData()
        }, [])
    )

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            if (!session?.user) return

            // Profile
            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single()
            setProfile(profileData)
            if (profileData?.tdee) setTargetCalories(profileData.tdee)

            // Today's Meals
            const today = new Date().toISOString().split('T')[0]
            const { data: meals } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('date', today)

            const stats = meals?.reduce((acc: any, meal: any) => ({
                calories: acc.calories + meal.total_calories,
                protein: acc.protein + meal.total_protein,
                carbs: acc.carbs + meal.total_carbs,
                fat: acc.fat + meal.total_fat
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

            if (stats) setDailyStats(stats)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const renderProgressRing = (current: number, target: number) => {
        const percentage = Math.min(current / target, 1)
        // Simple visual representation since we don't have SVG ring component handy yet
        // In full Magic UI we'd use SVG, here we use a Bar for robustness
        return (
            <View className="mt-4">
                <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-400 text-xs font-bold">CALORIES</Text>
                    <Text className="text-white text-xs font-bold">{current} / {target}</Text>
                </View>
                <View className="h-4 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                    <LinearGradient
                        colors={[theme.colors.primary, '#60A5FA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: `${percentage * 100}%`, height: '100%' }}
                    />
                </View>
                <Text className="text-right text-xs text-gray-500 mt-1">{Math.round(percentage * 100)}% Reached</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-[#050505]">
            <StatusBar style="light" />

            {/* Ambient Background Glow */}
            <LinearGradient
                colors={['rgba(37, 99, 235, 0.15)', 'transparent']}
                start={{ x: 0.5, y: -0.1 }}
                end={{ x: 0.5, y: 0.4 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400 }}
            />

            <SafeAreaView className="flex-1">
                <ScrollView
                    className="flex-1"
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} tintColor={theme.colors.primary} />}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 py-4">
                        <View>
                            <Text className="text-gray-400 text-sm font-medium">Welcome back,</Text>
                            <Text className="text-white text-2xl font-bold tracking-tight">
                                {profile?.full_name?.split(' ')[0] || 'Athlete'}
                            </Text>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 items-center justify-center shadow-lg shadow-blue-500/20">
                            <Ionicons name="person" size={20} color="white" />
                        </View>
                    </View>

                    {/* Main Bento Grid */}
                    <BentoGrid>
                        {/* 1. Daily Summary (Wide) */}
                        <BentoCard
                            span={2}
                            title="Daily Progress"
                            subtitle="Keep pushing your limits."
                            className="bg-gray-900/40"
                        >
                            <View className="flex-1 justify-center">
                                <Text className="text-5xl font-extrabold text-white tracking-tighter">
                                    {targetCalories - dailyStats.calories}
                                </Text>
                                <Text className="text-gray-400 text-sm font-medium mb-4">kcal remaining</Text>
                                {renderProgressRing(dailyStats.calories, targetCalories)}
                                <View className="flex-row justify-between mt-6 px-2">
                                    <View>
                                        <Text className="text-blue-400 font-bold">{dailyStats.protein}g</Text>
                                        <Text className="text-gray-600 text-[10px] uppercase">Protein</Text>
                                    </View>
                                    <View>
                                        <Text className="text-purple-400 font-bold">{dailyStats.carbs}g</Text>
                                        <Text className="text-gray-600 text-[10px] uppercase">Carbs</Text>
                                    </View>
                                    <View>
                                        <Text className="text-yellow-400 font-bold">{dailyStats.fat}g</Text>
                                        <Text className="text-gray-600 text-[10px] uppercase">Fat</Text>
                                    </View>
                                </View>
                            </View>
                        </BentoCard>

                        {/* 2. Scan Meal (Tall/Wide) */}
                        <BentoCard
                            span={2}
                            title="AI Food Scan"
                            subtitle="Snap a photo to log instant calories."
                            className="h-48"
                            background={
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }}
                                    className="w-full h-full opacity-40"
                                    resizeMode="cover"
                                />
                            }
                        >
                            <View className="absolute bottom-4 right-4">
                                <MagicButton
                                    title="Scan Now"
                                    icon={<Ionicons name="camera" size={18} color="white" />}
                                    onPress={() => navigation.navigate('PhotoAnalysis')}
                                    style={{ transform: [{ scale: 0.9 }] }}
                                />
                            </View>
                        </BentoCard>

                        {/* 3. Workout (Square) */}
                        <BentoCard
                            span={1}
                            title="Workout"
                            subtitle="Today's Plan"
                            icon={<Ionicons name="barbell" size={24} color="#F59E0B" />}
                        >
                            <View className="flex-1 justify-end">
                                <MagicButton
                                    title="Start"
                                    variant="secondary"
                                    onPress={() => navigation.navigate('WorkoutPlan')}
                                    style={{ marginTop: 10 }}
                                />
                            </View>
                        </BentoCard>

                        {/* 4. AI Coach (Square) */}
                        <BentoCard
                            span={1}
                            title="AI Coach"
                            subtitle="Ask Anything"
                            icon={<Ionicons name="chatbubble-ellipses" size={24} color="#10B981" />}
                        >
                            <View className="flex-1 justify-end">
                                <MagicButton
                                    title="Chat"
                                    variant="secondary"
                                    onPress={() => navigation.navigate('Chat')}
                                    style={{ marginTop: 10 }}
                                />
                            </View>
                        </BentoCard>

                        {/* 5. Barcode (Small/Strip) */}
                        <BentoCard
                            span={2}
                            className="h-20 flex-row items-center !p-0"
                            background={<LinearGradient colors={['#2563EB', '#1E40AF']} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />}
                        >
                            <View className="flex-row items-center justify-between w-full h-full px-6">
                                <View className="flex-row items-center">
                                    <Ionicons name="barcode-outline" size={24} color="white" />
                                    <View className="ml-4">
                                        <Text className="text-white font-bold text-lg">Quick Scan</Text>
                                        <Text className="text-blue-200 text-xs">Scan packaged foods</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="white" onPress={() => navigation.navigate('BarcodeScanner')} />
                            </View>
                        </BentoCard>

                    </BentoGrid>

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
