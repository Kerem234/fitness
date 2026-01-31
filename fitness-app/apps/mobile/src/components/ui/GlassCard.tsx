import React from 'react'
import { View, ViewProps, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface GlassCardProps extends ViewProps {
    children: React.ReactNode
    variant?: 'dark' | 'light' | 'primary'
}

export const GlassCard = ({ children, style, variant = 'dark', ...props }: GlassCardProps) => {
    let colors = ['rgba(39, 39, 42, 0.8)', 'rgba(24, 24, 27, 0.6)'] // default dark
    let borderColor = 'rgba(255,255,255,0.1)'

    if (variant === 'primary') {
        colors = ['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']
        borderColor = 'rgba(59, 130, 246, 0.3)'
    }

    return (
        <View style={[styles.container, style]} {...props}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
            />
            {/* Border overlay */}
            <View style={[StyleSheet.absoluteFill, {
                borderRadius: 24,
                borderWidth: 1,
                borderColor: borderColor
            }]} pointerEvents="none" />

            {/* Content */}
            <View style={{ padding: 20 }}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
    }
})
