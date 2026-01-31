import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'

const goals = [
    { id: 'lose_weight', title: 'Lose Weight', subtitle: 'Burn fat & get lean', icon: 'flame-outline' },
    { id: 'gain_muscle', title: 'Gain Muscle', subtitle: 'Build mass & strength', icon: 'barbell-outline' },
    { id: 'maintain', title: 'Maintain', subtitle: 'Stay fit & healthy', icon: 'heart-outline' },
    { id: 'improve_fitness', title: 'Improve Fitness', subtitle: 'Endurance & flexibility', icon: 'bicycle-outline' },
]

export const GoalScreen = ({ navigation }: any) => {
    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                <View className="px-6 pt-4 pb-8">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-white mb-2">What is your goal?</Text>
                    <Text className="text-gray-400 text-lg">This helps us tailor your plan.</Text>
                </View>

                <ScrollView className="flex-1 px-6 space-y-4">
                    {goals.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Demographics', { goal: goal.id })}
                            className="mb-4"
                        >
                            <LinearGradient
                                colors={['#1c1c1e', '#2c2c2e']}
                                className="p-5 rounded-2xl border border-white/10 flex-row items-center space-x-4"
                            >
                                <View className="w-12 h-12 rounded-full bg-primary/20 justify-center items-center">
                                    <Ionicons name={goal.icon as any} size={24} color="#007AFF" />
                                </View>
                                <View className="flex-1 ml-4">
                                    <Text className="text-white text-lg font-bold">{goal.title}</Text>
                                    <Text className="text-gray-400 text-sm">{goal.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#666" />
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
