import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ConfirmationProvider } from './src/components/ConfirmationProvider';

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ConfirmationProvider>
          <AppNavigator />
        </ConfirmationProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
