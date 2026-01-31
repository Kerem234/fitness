import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../services/supabase'
import { getDailyNutrition } from '../../services/nutrition'
import { MacroProgress } from '../../components/MacroProgress'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'

export const DashboardScreen = ({ navigation }: any) => {
    const { session } = useAuthStore()
    const [profile, setProfile] = useState<any>(null)
    const [dailyStats, setDailyStats] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    })
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = async () => {
        try {
            if (!session?.user) return

            // 1. Get Profile (Targets)
            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single()

            if (profileData) setProfile(profileData)

            // 2. Get Daily Logs
            const meals = await getDailyNutrition(new Date())

            // 3. Aggregate
            let stats = { calories: 0, protein: 0, carbs: 0, fat: 0 }
            meals.forEach((meal: any) => {
                stats.calories += meal.total_calories || 0
                stats.protein += meal.total_protein_g || 0
                stats.carbs += meal.total_carbs_g || 0
                stats.fat += meal.total_fat_g || 0
            })
            setDailyStats(stats)

        } catch (error) {
            console.error(error)
        } finally {
            setRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchData()
        }, [session])
    )

    const onRefresh = () => {
        setRefreshing(true)
        fetchData()
    }

    const remainingCals = (profile?.target_calories || 2000) - dailyStats.calories

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                <View className="flex-row justify-between items-center px-6 py-4">
                    <View>
                        <Text className="text-gray-400">Welcome,</Text>
                        <Text className="text-white text-xl font-bold">{session?.user?.email?.split('@')[0]}</Text>
                    </View>
                    <TouchableOpacity onPress={() => supabase.auth.signOut()}>
                        <Ionicons name="log-out-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                >
                    {/* Main Calorie Card */}
                    <LinearGradient
                        colors={['#1c1c1e', '#2c2c2e']}
                        className="p-6 rounded-3xl mb-6 shadow-lg border border-white/5"
                    >
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-4xl font-bold text-white">{remainingCals}</Text>
                                <Text className="text-gray-400">Calories Remaining</Text>
                            </View>
                            <View className="h-16 w-16 rounded-full border-4 border-primary justify-center items-center">
                                <Text className="text-white font-bold">{Math.round(dailyStats.calories)}</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between">
                            <MacroProgress label="Protein" current={dailyStats.protein} target={profile?.target_protein_g || 150} color="#FF2D55" />
                            <MacroProgress label="Carbs" current={dailyStats.carbs} target={profile?.target_carbs_g || 200} color="#5AC8FA" />
                            <MacroProgress label="Fat" current={dailyStats.fat} target={profile?.target_fat_g || 60} color="#FFCC00" />
                        </View>
                    </LinearGradient>

                    {/* Meal Actions */}
                    <Text className="text-white text-lg font-bold mb-4">Log Meal</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => navigation.navigate('FoodSearch', { mealType: type.toLowerCase() })}
                                className="w-[48%] bg-gray-900 p-4 rounded-xl mb-4 flex-row items-center space-x-3 border border-gray-800"
                            >
                                <View className="bg-gray-800 p-2 rounded-full">
                                    <Ionicons name="add" size={20} color="white" />
                                </View>
                                <Text className="text-white font-bold">{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('WorkoutPlan')}
                        className="bg-gray-900 p-4 rounded-xl flex-row items-center justify-between border border-gray-800 mt-2 mb-2"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-orange-500/20 p-2 rounded-full mr-3">
                                <Ionicons name="barbell" size={24} color="#FF9500" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">My Workout Plan</Text>
                                <Text className="text-gray-400 text-xs">AI Generated Schedule</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-primary/10 p-4 rounded-xl flex-row items-center justify-center border border-primary/30 mt-2">
                        <Ionicons name="camera" size={24} color="#007AFF" />
                        <Text className="text-primary font-bold ml-2">AI Food Scan (Coming Soon)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Chat')}
                        className="bg-gray-900 p-4 rounded-xl flex-row items-center justify-between border border-gray-800 mt-2 mb-6"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-purple-500/20 p-2 rounded-full mr-3">
                                <Ionicons name="chatbubble-ellipses" size={24} color="#AF52DE" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">Ask AI Coach</Text>
                                <Text className="text-gray-400 text-xs">Get advice & tips</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
