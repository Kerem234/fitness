import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

export const WelcomeScreen = ({ navigation }: any) => {
    return (
        <View className="flex-1">
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1 justify-between p-6">
                    <View className="flex-1 justify-center items-center">
                        <View className="w-32 h-32 bg-primary/20 rounded-full justify-center items-center mb-8 border border-primary/30 shadow-lg shadow-black/50">
                            {/* Placeholder for Logo */}
                            <Text className="text-4xl">💪</Text>
                        </View>
                        <Text className="text-4xl font-bold text-white text-center mb-2 tracking-tight">
                            Fitness AI
                        </Text>
                        <Text className="text-lg text-gray-400 text-center px-4 leading-6">
                            Your personal AI coach for nutrition and workouts. Smart, adaptive, and always with you.
                        </Text>
                    </View>

                    <View className="w-full space-y-4">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Auth', { screen: 'Register' })} // Or Onboarding flow
                            className="w-full"
                        >
                            <LinearGradient
                                colors={['#007AFF', '#0055FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-4 rounded-2xl items-center shadow-lg shadow-blue-900/50"
                            >
                                <Text className="text-white font-bold text-lg">Get Started</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                            className="py-4 rounded-2xl items-center border border-white/10 bg-white/5"
                        >
                            <Text className="text-white font-bold text-lg">I have an account</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </View>
    )
}
