import React from 'react'
import { View, Text } from 'react-native'

export const MacroProgress = ({ label, current, target, color }: any) => {
    const percentage = Math.min(100, Math.max(0, (current / target) * 100))

    return (
        <View className="flex-1 items-center mx-1">
            <View className="h-32 w-4 bg-gray-800 rounded-full justify-end overflow-hidden">
                <View
                    style={{ height: `${percentage}%`, backgroundColor: color }}
                    className="w-full rounded-full"
                />
            </View>
            <Text className="text-white font-bold mt-2">{Math.round(current)}g</Text>
            <Text className="text-gray-500 text-xs">{label}</Text>
        </View>
    )
}
