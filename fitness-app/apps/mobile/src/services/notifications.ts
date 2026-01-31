import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return 'denied';
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        // console.log('Must use physical device for Push Notifications');
    }

    return 'granted';
}

export async function scheduleDailyReminders() {
    // Cancel existing to avoid duplicates on reload
    await Notifications.cancelAllScheduledNotificationsAsync()

    // 1. Morning Motivation (08:00)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Good Morning, Athlete! ☀️",
            body: "Start your day with a healthy breakfast. Log it now!",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 8,
            minute: 0,
            repeats: true,
        },
    })

    // 2. Lunch Check (12:30)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Lunch Time 🥗",
            body: "Don't forget to track your lunch. Stay consistent!",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 12,
            minute: 30,
            repeats: true,
        },
    })

    // 3. Evening/Workout Review (19:00)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Day Review 🌙",
            body: "Did you complete your workout today? Log your progress.",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 19,
            minute: 0,
            repeats: true,
        },
    })

    console.log("Scheduled daily reminders.")
}
