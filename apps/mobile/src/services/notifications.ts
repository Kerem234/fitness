import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const registerForPushNotificationsAsync = async () => {
    let token;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null; // Failed to get permission
    }

    // Configuration for Android
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return finalStatus;
};

export const scheduleDailyReminders = async () => {
    // Cancel existing to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const reminders = [
        { title: "Good Morning! ☀️", body: "Don't forget to log your breakfast.", hour: 9, minute: 0 },
        { title: "Lunch Time 🥗", body: "Keep your streak going! Log your lunch.", hour: 13, minute: 0 },
        { title: "Workout Time 💪", body: "Time to crush your daily goals!", hour: 17, minute: 30 },
        { title: "Dinner & Wrap Up 🌙", body: "Log your dinner and check your macros.", hour: 20, minute: 0 },
    ];

    for (const reminder of reminders) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: reminder.title,
                body: reminder.body,
                sound: true,
            },
            trigger: {
                hour: reminder.hour,
                minute: reminder.minute,
                repeats: true,
            },
        });
    }
};
