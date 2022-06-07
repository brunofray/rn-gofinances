import React from 'react';
import { View, Text, StatusBar, LogBox } from 'react-native';
import { ThemeProvider } from 'styled-components';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';

import { Routes } from './src/routes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

import { AuthProvider, useAuth } from './src/hooks/auth';
import { SendNotification } from './src/hooks/push-notification';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const { userStorageLoading } = useAuth();
  
  if(!fontsLoaded || userStorageLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Carregando...</Text></View>
  }

  LogBox.ignoreLogs(["EventEmitter.removeListener"]);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle="light-content" translucent={true} backgroundColor={theme.colors.primary} />
        <AuthProvider>
          <SendNotification>
            <Routes />
          </SendNotification>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}