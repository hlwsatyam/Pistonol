import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';

export default function TestNotification() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestUserPermission();
    createNotificationChannel();
  }, []);

  // Request permission (Android 13+)
  async function requestUserPermission() {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      console.log('✅ Notification permission granted');
      setHasPermission(true);
    } else {
      console.warn('❌ Notification permission denied');
      setHasPermission(false);
    }
  }

  // Create notification channel
  async function createNotificationChannel() {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }

  // Show immediate notification
  async function onDisplayNotification() {
    if (!hasPermission) {
      await requestUserPermission();
      if (!hasPermission) return;
    }

    await notifee.displayNotification({
      title: '🚀 New Notification',
      body: 'This is an immediate notification!',
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher', // must exist in res/drawable
        pressAction: { id: 'default' },
      },
    });
  }

  // Schedule notification for 1 minute later
  async function onScheduleNotification() {
    if (!hasPermission) {
      await requestUserPermission();
      if (!hasPermission) return;
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 60 * 1000,
    };

    await notifee.createTriggerNotification(
      {
        title: '⏰ Scheduled Notification',
        body: 'This will appear in 1 minute!',
        android: {
          channelId: 'default',
          pressAction: { id: 'default' },
        },
      },
      trigger
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
      <Text style={{ marginBottom: 16 }}>
        Permission: {hasPermission ? '✅ Granted' : '❌ Not Granted'}
      </Text>
      <Button mode="contained" onPress={onDisplayNotification}>
        Show Notification
      </Button>
      <Button mode="contained" onPress={onScheduleNotification}>
        Schedule Notification
      </Button>
    </View>
  );
}
