import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef, useContext, createContext, ReactNode } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface PushNotificationProviderProps {
  children: ReactNode;
}

export interface MessageProps {
  message: {
    to: string;
    sound: 'default';
    title: string;
    body: string;
    data: { 
      someData: string; 
    },
  };
}

interface PushNotificationContextData {
  expoPushToken: string;
  sendPushNotification(message: MessageProps): Promise<void>;
}

const PushNotificationContext = createContext({} as PushNotificationContextData);

function SendNotification({ children }: PushNotificationProviderProps){
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
  async function sendPushNotification(message: MessageProps) {
    console.log(expoPushToken);
    try {  
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return '';
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return String(token);
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    if ( responseListener.current ) {
      // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
    }

    return () => {
      if ( notificationListener.current ) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if ( responseListener.current ) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return(
    <PushNotificationContext.Provider value={{
      expoPushToken,
      sendPushNotification,
    }}>
      { children }
    </PushNotificationContext.Provider>
  );
}

function usePushNotification() {
  return useContext(PushNotificationContext);
}

export { SendNotification, usePushNotification };