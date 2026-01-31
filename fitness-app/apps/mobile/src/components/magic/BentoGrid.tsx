import React, { ReactNode } from 'react'
import { View, Text, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { cn } from '../../utils/cn' // Assuming a utility or I'll inline styles if needed
// Simple clsx replacement for now if cn doesn't exist:
const cls = (...args: any[]) => args.filter(Boolean).join(' ')

interface BentoConfig {
    span?: number // 1 or 2 columns
    title?: string
    subtitle?: string
    icon?: ReactNode
    className?: string
    children?: ReactNode
    background?: ReactNode
}

// Container
export const BentoGrid = ({ children, className }: { children: ReactNode, className?: string }) => {
    return (
        <View className={cls("flex-row flex-wrap justify-between p-4", className)}>
            {children}
        </View>
    )
}

// Card
export const BentoCard = ({ span = 1, title, subtitle, icon, className, children, background }: BentoConfig) => {
    const widthClass = span === 2 ? 'w-[100%]' : 'w-[48%]'

    return (
        <View
            className={cls(
                widthClass,
                "bg-gray-900/60 border border-white/10 rounded-3xl overflow-hidden mb-4 relative",
                className
            )}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
                minHeight: 160
            }}
        >
            {/* Background Layer */}
            <View className="absolute inset-0 opacity-50">
                {background || (
                    <LinearGradient
                        colors={['rgba(255,255,255,0.05)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1 }}
                    />
                )}
            </View>

            {/* Content Layer */}
            <View className="p-5 flex-1 justify-between z-10">
                <View>
                    {background ? null : ( // If custom background, minimize header
                        <View className="mb-2">
                            {icon && <View className="mb-2">{icon}</View>}
                            {title && <Text className="text-white font-bold text-lg">{title}</Text>}
                            {subtitle && <Text className="text-gray-400 text-xs">{subtitle}</Text>}
                        </View>
                    )}
                    {children}
                </View>

                {/* Bottom Text for image-heavy cards */}
                {background && (title || subtitle) && (
                    <View>
                        {title && <Text className="text-white font-bold text-lg shadow-black">{title}</Text>}
                        {subtitle && <Text className="text-gray-300 text-xs shadow-black">{subtitle}</Text>}
                    </View>
                )}
            </View>

            {/* Gloss Effect */}
            <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 skew-y-12 transform -translate-y-4" />
        </View>
    )
}
