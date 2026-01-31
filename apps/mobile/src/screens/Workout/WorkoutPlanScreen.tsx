import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { generateWorkoutPlan } from '../../services/ai_coach'
import { supabase } from '../../services/supabase'
import { WeeklyPlan } from '../../types/workout'
import { LinearGradient } from 'expo-linear-gradient'

export const WorkoutPlanScreen = ({ navigation }: any) => {
    const [plan, setPlan] = useState<WeeklyPlan | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPlan()
    }, [])

    const loadPlan = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()

            // Todo: Check if active plan exists in DB first
            const newPlan = await generateWorkoutPlan(profile)
            setPlan(newPlan)
        } catch (e) {
            console.error(e)
            alert("Failed to generate plan")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="text-white mt-4 font-bold">AI Coach is designing your plan...</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                <View className="px-6 py-4">
                    <Text className="text-gray-400 text-lg">Current Plan</Text>
                    <Text className="text-white text-3xl font-bold">{plan?.goal}</Text>
                </View>

                <ScrollView className="flex-1 px-6">
                    {plan?.days.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            className="mb-4"
                            disabled={day.focus_area === 'Rest'}
                        >
                            <LinearGradient
                                colors={day.focus_area === 'Rest' ? ['#1a1a1a', '#1a1a1a'] : ['#007AFF', '#0055FF']}
                                className={`p-5 rounded-2xl ${day.focus_area === 'Rest' ? 'opacity-50' : ''}`}
                            >
                                <View className="flex-row justify-between items-center">
                                    <View>
                                        <Text className={`font-bold text-lg ${day.focus_area === 'Rest' ? 'text-gray-400' : 'text-white'}`}>
                                            {day.day_name}
                                        </Text>
                                        <Text className={`${day.focus_area === 'Rest' ? 'text-gray-500' : 'text-blue-100'}`}>
                                            {day.focus_area}
                                        </Text>
                                    </View>
                                    {day.focus_area !== 'Rest' && (
                                        <Ionicons name="chevron-forward" size={24} color="white" />
                                    )}
                                </View>
                                {day.focus_area !== 'Rest' && (
                                    <View className="mt-4 pt-4 border-t border-white/20">
                                        {day.exercises.slice(0, 3).map((ex, i) => (
                                            <Text key={i} className="text-white/90 text-sm mb-1">
                                                • {ex.exercise.name} ({ex.sets}x{ex.target_reps})
                                            </Text>
                                        ))}
                                        {day.exercises.length > 3 && (
                                            <Text className="text-white/60 text-xs mt-1">+ {day.exercises.length - 3} more</Text>
                                        )}
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
