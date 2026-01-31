import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'

import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { checkProStatus } from '../../services/revenuecat'
import { GlassCard } from '../../components/ui/GlassCard'
import { MagicButton } from '../../components/magic/MagicButton'
import { theme } from '../../theme/designSystem'

export const ProfileScreen = ({ navigation }: any) => {
    const { session, signOut } = useAuthStore()
    const [profile, setProfile] = useState<any>(null)
    const [isPro, setIsPro] = useState(false)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    useFocusEffect(
        useCallback(() => {
            loadProfile()
        }, [])
    )

    const loadProfile = async () => {
        if (!session?.user) return
        const { data } = await supabase.from('user_profiles').select('*').eq('user_id', session.user.id).single()
        setProfile(data)
        const proStatus = await checkProStatus()
        setIsPro(proStatus)
    }

    const handleLogout = async () => {
        Alert.alert("Sign Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut() }
        ])
    }

    const StatBox = ({ label, value, unit }: any) => (
        <View className="flex-1 items-center bg-gray-900/50 p-3 rounded-2xl border border-white/5 mx-1">
            <Text className="text-white font-bold text-lg">{value}</Text>
            <Text className="text-gray-500 text-[10px] uppercase font-bold">{unit}</Text>
            <Text className="text-blue-400 text-[10px] mt-1">{label}</Text>
        </View>
    )

    const SettingRow = ({ icon, label, onPress, value }: any) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center justify-between p-4 bg-gray-900/40 border-b border-white/5 last:border-0">
            <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center mr-3">
                    <Ionicons name={icon} size={16} color="white" />
                </View>
                <Text className="text-gray-200 font-medium">{label}</Text>
            </View>
            <View className="flex-row items-center">
                {value && <Text className="text-gray-500 mr-2 text-sm">{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color="gray" />
            </View>
        </TouchableOpacity>
    )

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* Header Background */}
            <LinearGradient
                colors={['rgba(37, 99, 235, 0.2)', 'transparent']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
            />

            <SafeAreaView className="flex-1">
                <View className="px-6 py-4 flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-gray-900/80 items-center justify-center border border-white/10">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">My Profile</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Paywall')} className="w-10 h-10 rounded-full bg-gray-900/80 items-center justify-center border border-blue-500/50">
                        <Ionicons name="diamond" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-4">
                    {/* Identity Card */}
                    <GlassCard className="items-center py-8 mb-6 relative overflow-hidden">
                        <View className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px] mb-4">
                            <View className="flex-1 bg-black rounded-full items-center justify-center overflow-hidden">
                                {isPro ? (
                                    <Image source={{ uri: 'https://ui-avatars.com/api/?name=Pro+User&background=0D8ABC&color=fff' }} className="w-full h-full" />
                                ) : (
                                    <Ionicons name="person" size={40} color="gray" />
                                )}
                            </View>
                        </View>

                        <Text className="text-white text-2xl font-bold">{profile?.full_name || 'Athlete'}</Text>
                        <Text className="text-gray-400 text-sm mb-4">{profile?.email || 'No Email'}</Text>

                        {isPro && (
                            <View className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/50">
                                <Text className="text-blue-400 text-xs font-bold uppercase tracking-wider">PRO MEMBER</Text>
                            </View>
                        )}

                        <View className="flex-row mt-8 w-full justify-between px-2">
                            <StatBox label="Weight" value={profile?.weight || '--'} unit="KG" />
                            <StatBox label="Height" value={profile?.height || '--'} unit="CM" />
                            <StatBox label="Age" value={profile?.age || '--'} unit="YRS" />
                        </View>
                    </GlassCard>

                    {/* Settings Group */}
                    <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-3 ml-2">Settings</Text>
                    <View className="rounded-2xl overflow-hidden bg-gray-900/30 border border-white/5 mb-8">
                        <SettingRow icon="notifications" label="Notifications" value="On" onPress={() => { }} />
                        <SettingRow icon="time" label="Schedule" value="Edit Times" onPress={() => navigation.navigate('ScheduleSettings')} />
                        <SettingRow icon="lock-closed" label="Privacy" onPress={() => { }} />
                        <SettingRow icon="help-circle" label="Support" onPress={() => { }} />
                    </View>

                    <MagicButton
                        title="Sign Out"
                        onPress={handleLogout}
                        variant="secondary"
                        style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    />

                    <View className="h-10" />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
