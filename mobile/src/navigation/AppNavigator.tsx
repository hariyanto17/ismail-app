import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../redux/store';
import { restoreCredentials } from '../redux/authSlice';
import { theme } from '../utils/theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import UsersScreen from '../screens/UsersScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let savedToken = null;
      let savedRefreshToken = null;
      let savedUser = null;

      try {
        savedToken = await AsyncStorage.getItem('token');
        savedRefreshToken = await AsyncStorage.getItem('refreshToken');
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          savedUser = JSON.parse(userStr);
        }
      } catch (e) {
        console.error('Failed to load persisted credentials from storage');
      }

      dispatch(
        restoreCredentials({
          token: savedToken,
          refreshToken: savedRefreshToken,
          user: savedUser,
        })
      );
    };

    bootstrapAsync();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F5936',
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          cardStyle: { backgroundColor: '#F9FAFB' },
        }}
      >
        {token === null ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'New Sale' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Sales History' }} />
            <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Manage Products' }} />
            <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
            <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Manage Users' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Printer Settings' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default AppNavigator;
