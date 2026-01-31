import React, { useState } from 'react'
import { View, Text, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'

import { analyzeFoodImage } from '../../services/openai'
import { logMeal } from '../../services/nutrition'
import { checkUsageLimit, incrementUsage, DAILY_LIMIT_FREE } from '../../services/limits'
import { checkProStatus } from '../../services/revenuecat'
import { MagicButton } from '../../components/magic/MagicButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { theme } from '../../theme/designSystem'

export const PhotoAnalysisScreen = ({ navigation }: any) => {
    const [image, setImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any>(null)

    const pickImage = async (useCamera: boolean) => {
        // 1. Check Limits First
        const isPro = await checkProStatus()
        if (!isPro) {
            const allowed = await checkUsageLimit('user_id_placeholder', 'scan_food') // In real app use real ID
            if (!allowed) {
                Alert.alert("Limit Reached", `You've used all ${DAILY_LIMIT_FREE} free scans today.`, [
                    { text: "Go Pro", onPress: () => navigation.navigate('Paywall') },
                    { text: "Cancel", style: "cancel" }
                ])
                return
            }
        }

        let result;
        if (useCamera) {
            await ImagePicker.requestCameraPermissionsAsync()
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            })
        } else {
            await ImagePicker.requestMediaLibraryPermissionsAsync()
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            })
        }

        if (!result.canceled && result.assets[0].base64) {
            setImage(result.assets[0].uri)
            analyze(result.assets[0].base64)
            if (!isPro) await incrementUsage('user_id_placeholder', 'scan_food')
        }
    }

    const analyze = async (base64: string) => {
        setLoading(true)
        try {
            const data = await analyzeFoodImage(base64)
            setResults(data)
        } catch (e: any) {
            Alert.alert("Analysis Failed", "Could not analyze the image. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!results?.foods) return
        try {
            await logMeal('user_id_placeholder', results.foods) // Replace user_id
            Alert.alert("Success", "Meal logged successfully!")
            navigation.goBack()
        } catch (e) {
            Alert.alert("Error", "Failed to save meal.")
        }
    }

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <StatusBar style="light" />
                <View className="absolute inset-0 bg-blue-500/10" />

                {/* Scanner Animation Effect */}
                <View className="w-64 h-64 border-2 border-blue-500 rounded-3xl items-center justify-center relative overflow-hidden">
                    <LinearGradient
                        colors={['transparent', 'rgba(59, 130, 246, 0.5)', 'transparent']}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                    />
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
                <Text className="text-white text-xl font-bold mt-8 tracking-widest uppercase">Analyzing...</Text>
                <Text className="text-blue-400 text-sm mt-2">AI is identifying ingredients</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-gray-900 border border-white/10 items-center justify-center">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">AI Scan</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1">
                    {!image ? (
                        <View className="flex-1 items-center justify-center mt-20 px-8">
                            <View className="w-full aspect-square border-2 border-dashed border-gray-700 rounded-3xl items-center justify-center mb-10 bg-gray-900/30">
                                <Ionicons name="scan-outline" size={80} color="#4B5563" />
                                <Text className="text-gray-500 mt-4 font-medium">Place food in frame</Text>
                            </View>

                            <MagicButton
                                title="Take Photo"
                                icon={<Ionicons name="camera" size={20} color="white" />}
                                onPress={() => pickImage(true)}
                                style={{ width: '100%', marginBottom: 16 }}
                            />
                            <MagicButton
                                title="Upload from Gallery"
                                variant="secondary"
                                icon={<Ionicons name="images" size={20} color="white" />}
                                onPress={() => pickImage(false)}
                                style={{ width: '100%' }}
                            />
                        </View>
                    ) : (
                        <View className="px-6">
                            <View className="w-full h-64 rounded-3xl overflow-hidden mb-6 border border-white/10 shadow-lg shadow-blue-500/20">
                                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    className="absolute bottom-0 left-0 right-0 h-20"
                                />
                            </View>

                            {results && (
                                <View>
                                    <Text className="text-white font-bold text-2xl mb-4">Results</Text>
                                    {results.foods.map((food: any, index: number) => (
                                        <GlassCard key={index} className="mb-4 !p-0 overflow-hidden">
                                            <View className="p-4 flex-row justify-between items-center bg-white/5">
                                                <Text className="text-white font-bold text-lg flex-1">{food.name}</Text>
                                                <Text className="text-blue-400 font-bold text-xl">{food.calories} kcal</Text>
                                            </View>
                                            <View className="flex-row divide-x divide-white/10 border-t border-white/10">
                                                <View className="flex-1 p-3 items-center">
                                                    <Text className="text-gray-400 text-xs uppercase">Protein</Text>
                                                    <Text className="text-white font-bold">{food.protein_g}g</Text>
                                                </View>
                                                <View className="flex-1 p-3 items-center">
                                                    <Text className="text-gray-400 text-xs uppercase">Carbs</Text>
                                                    <Text className="text-white font-bold">{food.carbs_g}g</Text>
                                                </View>
                                                <View className="flex-1 p-3 items-center">
                                                    <Text className="text-gray-400 text-xs uppercase">Fat</Text>
                                                    <Text className="text-white font-bold">{food.fat_g}g</Text>
                                                </View>
                                            </View>
                                        </GlassCard>
                                    ))}

                                    <MagicButton title="Log Meal" onPress={handleSave} style={{ marginTop: 10 }} />
                                    <MagicButton title="Retake" variant="secondary" onPress={() => setImage(null)} style={{ marginTop: 16, marginBottom: 40 }} />
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
