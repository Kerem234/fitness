import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export const WelcomeScreen = ({ navigation }: any) => {
    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* Background Image / Gradient */}
            <LinearGradient
                colors={['#000000', '#1c1c1e', '#000000']}
                className="absolute w-full h-full"
            />

            <SafeAreaView className="flex-1 justify-between p-6">

                {/* Hero Section */}
                <View className="flex-1 justify-center items-center mt-10">
                    <View className="w-40 h-40 bg-gray-900 rounded-full justify-center items-center mb-10 border-4 border-primary/20 shadow-2xl shadow-primary/30">
                        {/* Replaced Text Emoji with sleek Icon */}
                        <Ionicons name="fitness" size={80} color="#007AFF" />
                    </View>

                    <Text className="text-5xl font-extrabold text-white text-center mb-4 tracking-tighter">
                        FITNESS<Text className="text-primary">AI</Text>
                    </Text>

                    <Text className="text-lg text-gray-400 text-center px-4 leading-7 font-medium">
                        Transform your body with{'\n'}
                        <Text className="text-white font-bold">Smart Pricing</Text> & <Text className="text-white font-bold">AI Coaching</Text>
                    </Text>
                </View>

                {/* Actions */}
                <View className="w-full space-y-4 mb-8">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Register')}
                        className="w-full"
                    >
                        <LinearGradient
                            colors={['#007AFF', '#0055FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-blue-900/40"
                        >
                            <Text className="text-white font-bold text-xl mr-2">Get Started</Text>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Login')}
                        className="py-5 rounded-2xl items-center border border-gray-800 bg-gray-900/50"
                    >
                        <Text className="text-gray-300 font-bold text-lg">I have an account</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    )
}
