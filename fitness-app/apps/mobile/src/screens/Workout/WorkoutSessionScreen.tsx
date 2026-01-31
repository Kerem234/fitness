import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Vibration } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../services/supabase'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../../theme/designSystem'
import { MagicButton } from '../../components/magic/MagicButton'

export const WorkoutSessionScreen = ({ navigation, route }: any) => {
    const { dayId, dayName, exercises } = route.params
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [completedSets, setCompletedSets] = useState<Set<string>>(new Set())
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        let interval: any
        if (!isPaused) {
            interval = setInterval(() => {
                setElapsedSeconds(s => s + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isPaused])

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const toggleSet = (id: string) => {
        const newSet = new Set(completedSets)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
            Vibration.vibrate(50) // Haptic feedback
        }
        setCompletedSets(newSet)
    }

    const handleFinish = async () => {
        Alert.alert("Complete Mission", "End current session?", [
            { text: "Cancel", style: "cancel" },
            { text: "Confirm", style: "destructive", onPress: saveWorkout }
        ])
    }

    const saveWorkout = async () => {
        try {
            const { error } = await supabase.from('workout_days').update({ is_completed: true }).eq('id', dayId)
            if (error) throw error
            navigation.popToTop()
        } catch (e: any) {
            Alert.alert("Error", e.message)
        }
    }

    // Calculate progress
    const totalSets = exercises.reduce((acc: number, ex: any) => acc + ex.sets, 0)
    const completedCount = completedSets.size
    const progress = totalSets > 0 ? completedCount / totalSets : 0

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                {/* HUD Header */}
                <View className="px-6 pt-4 pb-6 bg-gray-900/50 border-b border-white/5">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">TARGET</Text>
                            <Text className="text-white font-black text-xl italic">{dayName}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">T-MINUS</Text>
                            <Text className={`text-4xl font-black font-mono tracking-tighter ${isPaused ? 'text-yellow-500' : 'text-blue-500'}`}>
                                {formatTime(elapsedSeconds)}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <LinearGradient
                            colors={['#3B82F6', '#60A5FA']}
                            style={{ height: '100%', width: `${progress * 100}%` }}
                        />
                    </View>
                </View>

                <ScrollView className="flex-1 px-4 pt-4">
                    {exercises.map((ex: any, i: number) => (
                        <View key={i} className="mb-8 pl-2">
                            {/* Exercise Header */}
                            <View className="flex-row items-center mb-3">
                                <View className="w-1 h-8 bg-blue-600 mr-3 rounded-full" />
                                <View>
                                    <Text className="text-white font-bold text-xl">{ex.exercise_name}</Text>
                                    <Text className="text-gray-500 text-xs font-mono">{ex.rest_seconds}S REST</Text>
                                </View>
                            </View>

                            {/* Sets Grid */}
                            <View className="flex-row flex-wrap">
                                {Array.from({ length: ex.sets }).map((_, setIndex) => {
                                    const setId = `${ex.id}-s${setIndex}`
                                    const isDone = completedSets.has(setId)
                                    return (
                                        <TouchableOpacity
                                            key={setId}
                                            onPress={() => toggleSet(setId)}
                                            className={`
                                                mr-3 mb-3 w-20 h-14 rounded-xl border items-center justify-center
                                                ${isDone ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-900 border-gray-800'}
                                            `}
                                        >
                                            <Text className={`font-black text-lg ${isDone ? 'text-blue-400' : 'text-gray-600'}`}>
                                                {ex.reps_text}
                                            </Text>
                                            <Text className="text-[9px] text-gray-500 uppercase">REPS</Text>

                                            {isDone && (
                                                <View className="absolute right-1 top-1">
                                                    <View className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>
                    ))}
                    <View className="h-32" />
                </ScrollView>

                {/* Footer Controls */}
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
                    <View className="flex-row space-x-4">
                        <TouchableOpacity
                            onPress={() => setIsPaused(!isPaused)}
                            className="flex-1 bg-gray-900 py-4 rounded-xl border border-gray-800 items-center"
                        >
                            <Text className="text-white font-bold uppercase">{isPaused ? "RESUME" : "PAUSE"}</Text>
                        </TouchableOpacity>

                        <View className="flex-[2]">
                            <MagicButton title="FINISH MISSION" onPress={handleFinish} variant="danger" />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    )
}
