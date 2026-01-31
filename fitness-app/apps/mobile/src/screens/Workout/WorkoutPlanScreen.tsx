import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'

import { supabase } from '../../services/supabase'
import { checkActivePlan, generateWorkoutPlanAI, saveFullPlan } from '../../services/workouts'
import { BentoGrid, BentoCard } from '../../components/magic/BentoGrid'
import { MagicButton } from '../../components/magic/MagicButton'
import { theme } from '../../theme/designSystem'

export const WorkoutPlanScreen = ({ navigation }: any) => {
    const [plan, setPlan] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [selectedDayIndex, setSelectedDayIndex] = useState(0)

    useFocusEffect(
        useCallback(() => {
            loadPlan()
        }, [])
    )

    const loadPlan = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const activePlan = await checkActivePlan(user.id)
            setPlan(activePlan)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()
            const aiPlan = await generateWorkoutPlanAI(profile || {})
            await saveFullPlan(user.id, aiPlan)
            await loadPlan()
        } catch (e: any) {
            Alert.alert("Error", e.message)
        } finally {
            setGenerating(false)
        }
    }

    if (loading || generating) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <View className="relative w-32 h-32 justify-center items-center">
                    <View className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
                <Text className="text-white font-bold mt-8 text-xl tracking-widest uppercase">
                    {generating ? 'Constructing Plan...' : 'Loading Data...'}
                </Text>
            </View>
        )
    }

    if (!plan) {
        return (
            <View className="flex-1 bg-black">
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' }}
                    className="flex-1"
                >
                    <LinearGradient colors={['black', 'transparent', 'black']} className="absolute inset-0" />
                    <SafeAreaView className="flex-1 px-6 justify-center">
                        <View className="items-center">
                            <Text className="text-white text-4xl font-black text-center mb-2 italic">NO PAIN NO GAIN</Text>
                            <Text className="text-gray-300 text-center mb-10">Your journey starts with a plan.</Text>
                            <MagicButton title="Generate AI Program" onPress={handleGenerate} style={{ width: '100%' }} />
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>
        )
    }

    const days = plan.days || []
    const currentDay = days[selectedDayIndex]

    return (
        <View className="flex-1 bg-[#09090b]">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center bg-black/50 border-b border-white/5">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="apps" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-black italic text-xl tracking-tighter">MISSION CONTROL</Text>
                    <TouchableOpacity onPress={handleGenerate}>
                        <Ionicons name="refresh-circle" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Day Selector */}
                <View className="py-6">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {days.map((day: any, index: number) => {
                            const isSelected = index === selectedDayIndex
                            return (
                                <TouchableOpacity
                                    key={day.id || index}
                                    onPress={() => setSelectedDayIndex(index)}
                                    className={`mr-4 w-16 h-20 rounded-2xl items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50' : 'bg-gray-900 border-gray-800'}`}
                                >
                                    <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}>DAY</Text>
                                    <Text className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>{index + 1}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>

                {/* Main Content */}
                <ScrollView className="flex-1 px-6">
                    <View className="mb-6 flex-row justify-between items-end">
                        <View>
                            <Text className="text-blue-500 font-bold tracking-widest text-xs mb-1 uppercase">Today's Focus</Text>
                            <Text className="text-white text-3xl font-black italic">{currentDay?.day_name}</Text>
                        </View>
                        <View className="bg-gray-900 px-3 py-1 rounded border border-white/10">
                            <Text className="text-gray-400 text-xs">{currentDay?.exercises?.length || 0} Exercises</Text>
                        </View>
                    </View>

                    {currentDay?.exercises?.map((ex: any, i: number) => (
                        <BentoCard
                            key={i}
                            span={2}
                            className="!min-h-[100px] mb-3 bg-gray-900/60"
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-blue-500/10 rounded-xl items-center justify-center mr-4 border border-blue-500/30">
                                    <Text className="text-blue-400 font-bold text-lg">{i + 1}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-lg mb-1">{ex.exercise_name}</Text>
                                    <View className="flex-row space-x-3">
                                        <Text className="text-gray-400 text-xs font-mono">{ex.sets} SETS</Text>
                                        <Text className="text-gray-600 text-xs">•</Text>
                                        <Text className="text-gray-400 text-xs font-mono">{ex.reps_text} REPS</Text>
                                    </View>
                                </View>
                            </View>
                        </BentoCard>
                    ))}

                    <View className="h-24" />
                </ScrollView>

                {/* Floating Start Button */}
                <View className="absolute bottom-8 left-6 right-6">
                    <MagicButton
                        title="INITIATE WORKOUT"
                        onPress={() => navigation.navigate('WorkoutSession', {
                            dayId: currentDay.id,
                            dayName: currentDay.day_name,
                            exercises: currentDay.exercises
                        })}
                        icon={<Ionicons name="play" size={20} color="white" />}
                        style={{ borderRadius: 24 }}
                    />
                </View>
            </SafeAreaView>
        </View>
    )
}
