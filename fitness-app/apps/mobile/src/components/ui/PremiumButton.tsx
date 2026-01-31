import React from 'react'
import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

interface PremiumButtonProps extends TouchableOpacityProps {
    title: string
    icon?: keyof typeof Ionicons.glyphMap
    loading?: boolean
    variant?: 'primary' | 'secondary' | 'outline'
    style?: StyleProp<ViewStyle>
}

export const PremiumButton = ({ title, icon, loading, variant = 'primary', style, disabled, ...props }: PremiumButtonProps) => {

    const getColors = () => {
        switch (variant) {
            case 'secondary': return ['#27272A', '#18181B']
            case 'outline': return ['transparent', 'transparent']
            default: return ['#3B82F6', '#2563EB'] // Primary Blue
        }
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={loading || disabled}
            style={[{ width: '100%' }, style]}
            {...props}
        >
            <LinearGradient
                colors={getColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderColor: variant === 'outline' ? '#3F3F46' : 'transparent'
                }}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        {icon && <Ionicons name={icon} size={20} color="white" style={{ marginRight: 8 }} />}
                        <Text className={`text-white font-bold text-lg ${variant === 'outline' ? 'text-gray-300' : ''}`}>
                            {title}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    )
}
