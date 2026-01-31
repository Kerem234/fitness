import React from 'react'
import { Text, TouchableOpacity, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface Props {
    title: string
    onPress?: () => void
    variant?: 'primary' | 'secondary' | 'danger'
    icon?: React.ReactNode
    style?: ViewStyle
    loading?: boolean
}

export const MagicButton = ({ title, onPress, variant = 'primary', icon, style, loading }: Props) => {
    const getColors = () => {
        switch (variant) {
            case 'primary': return ['#3B82F6', '#2563EB', '#1D4ED8'] // Blue Neon
            case 'secondary': return ['#1F2937', '#111827', '#030712'] // Dark
            case 'danger': return ['#EF4444', '#DC2626', '#991B1B']
            default: return ['#3B82F6', '#2563EB']
        }
    }

    const getShadow = () => {
        if (variant === 'primary') return {
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10
        }
        return {}
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="rounded-xl"
            style={[getShadow(), style]}
        >
            <LinearGradient
                colors={getColors() as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-6 py-4 rounded-xl flex-row items-center justify-center border border-white/10"
            >
                {icon && <View className="mr-2">{icon}</View>}
                <Text className="text-white font-bold text-base tracking-wide uppercase">
                    {loading ? 'Processing...' : title}
                </Text>
            </LinearGradient>
            {/* Shine Effect */}
            <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                className="absolute top-0 left-0 right-0 h-1/2 rounded-t-xl"
            />
        </TouchableOpacity>
    )
}
