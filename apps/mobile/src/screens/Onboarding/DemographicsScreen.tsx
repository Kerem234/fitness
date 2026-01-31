import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../services/supabase'
import { calculateBMR, calculateTDEE, calculateMacros } from '../../utils/calculations'

export const DemographicsScreen = ({ navigation, route }: any) => {
    const { goal } = route.params || {}
    const [age, setAge] = useState('')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null)

    const handleNext = async () => {
        if (!gender || !age || !height || !weight) {
            Alert.alert('Missing Info', 'Please fill in all fields')
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const weightNum = parseFloat(weight)
            const heightNum = parseFloat(height)
            const ageNum = parseInt(age)

            // Calculate initial targets
            const bmr = calculateBMR(weightNum, heightNum, ageNum, gender)
            const tdee = calculateTDEE(bmr, 'moderate') // Default to moderate for now
            const macros = calculateMacros(tdee)

            const { error } = await supabase.from('user_profiles').upsert({
                user_id: user.id,
                gender,
                birth_date: new Date(new Date().setFullYear(new Date().getFullYear() - ageNum)).toISOString(),
                height_cm: heightNum,
                goal_type: goal,
                activity_level: 'moderate',
                target_calories: tdee,
                target_protein_g: macros.protein_g,
                target_carbs_g: macros.carbs_g,
                target_fat_g: macros.fat_g,
            })

            if (error) throw error

            // Save initial weight
            await supabase.from('weights').insert({
                user_id: user.id,
                weight_kg: weightNum,
            })

            // Send welcome email (fire and forget)
            supabase.functions.invoke('send-email', {
                body: {
                    to: user.email,
                    subject: 'Welcome to Fitness AI! 🚀',
                    html: '<p>Thanks for joining! We are excited to help you reach your goals.</p>'
                }
            })

            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            })
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                <View className="px-6 pt-4 pb-6">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-white mb-2">About You</Text>
                    <Text className="text-gray-400 text-lg">We need this to calculate your calories.</Text>
                </View>

                <ScrollView className="flex-1 px-6">
                    <Text className="text-white font-bold mb-3 mt-4">Gender</Text>
                    <View className="flex-row justify-between mb-8">
                        {['male', 'female', 'other'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                onPress={() => setGender(g as any)}
                                className={`flex-1 py-4 rounded-xl border items-center mx-1 ${gender === g ? 'bg-primary border-primary' : 'bg-gray-900 border-gray-800'
                                    }`}
                            >
                                <Text className={`font-bold capitalize ${gender === g ? 'text-white' : 'text-gray-400'}`}>
                                    {g}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-white font-bold mb-3">Age</Text>
                    <TextInput
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        className="w-full bg-gray-900 text-white p-4 rounded-xl border border-gray-800 mb-6 text-lg"
                        placeholder="e.g. 25"
                        placeholderTextColor="#666"
                    />

                    <Text className="text-white font-bold mb-3">Height (cm)</Text>
                    <TextInput
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="numeric"
                        className="w-full bg-gray-900 text-white p-4 rounded-xl border border-gray-800 mb-6 text-lg"
                        placeholder="e.g. 180"
                        placeholderTextColor="#666"
                    />

                    <Text className="text-white font-bold mb-3">Weight (kg)</Text>
                    <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        className="w-full bg-gray-900 text-white p-4 rounded-xl border border-gray-800 mb-8 text-lg"
                        placeholder="e.g. 75"
                        placeholderTextColor="#666"
                    />
                </ScrollView>

                <View className="p-6">
                    <TouchableOpacity onPress={handleNext}>
                        <LinearGradient
                            colors={['#007AFF', '#0055FF']}
                            className="py-4 rounded-2xl items-center shadow-lg"
                        >
                            <Text className="text-white font-bold text-lg">Calculate Plan</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}
