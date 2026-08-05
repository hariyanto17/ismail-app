import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../redux/store';
import { restoreCredentials } from '../redux/authSlice';
import { theme } from '../utils/theme';
import { HomeIcon, ReportIcon, UserIcon } from '../components/Icons';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import UsersScreen from '../screens/UsersScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StoreSettingsScreen from '../screens/StoreSettingsScreen';
import DailyAnalyticsScreen from '../screens/DailyAnalyticsScreen';
import MonthlyAnalyticsScreen from '../screens/MonthlyAnalyticsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: '#0F5936',
    shadowColor: 'transparent',
    elevation: 0,
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: 'bold' as const,
  },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: '#F9FAFB' },
};

// Stack for Home tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="HomeMain" component={CartScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
  </Stack.Navigator>
);

// Stack for Report tab
const ReportStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ReportMain" component={ReportScreen} options={{ title: 'Daily Sales Report' }} />
  </Stack.Navigator>
);

// Stack for Profile tab
const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'User Profile' }} />
    <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Manage Products' }} />
    <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
    <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Manage Users' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Printer Settings' }} />
    <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Sales History' }} />
    <Stack.Screen name="DailyAnalytics" component={DailyAnalyticsScreen} options={{ title: 'Analisis Harian' }} />
    <Stack.Screen name="MonthlyAnalytics" component={MonthlyAnalyticsScreen} options={{ title: 'Analisis Bulanan' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, focused }) => {
        const size = 22;
        if (route.name === 'HomeTab') {
          return <HomeIcon color={color} size={size} strokeWidth={focused ? 2.5 : 2} />;
        } else if (route.name === 'ReportTab') {
          return <ReportIcon color={color} size={size} strokeWidth={focused ? 2.5 : 2} />;
        } else if (route.name === 'ProfileTab') {
          return <UserIcon color={color} size={size} strokeWidth={focused ? 2.5 : 2} />;
        }
        return null;
      },
      tabBarActiveTintColor: '#0F5936',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="ReportTab" component={ReportStack} options={{ tabBarLabel: 'Report' }} />
    <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

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
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {token === null ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
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
