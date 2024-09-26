import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import ThreatsScreen from './ThreatsScreen';
import ServiceProviderDashboardScreen from './ServiceProviderDashboardScreen';
import BillingDashboardScreen from './BillingDashboardScreen';

const Stack = createStackNavigator();

function LogoutButton({ navigation }) {
  return (
    <TouchableOpacity onPress={() => navigation.replace('Login')} style={{ marginRight: 15 }}>
      <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
    </TouchableOpacity>
  );
}

function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={({ navigation }) => ({
            headerRight: () => <LogoutButton navigation={navigation} />,
            headerStyle: { backgroundColor: '#004D40' },
            headerTintColor: '#fff',
          })}
        />
        <Stack.Screen 
          name="Threats" 
          component={ThreatsScreen} 
          options={({ navigation }) => ({
            title: 'Threat Center',
            headerRight: () => <LogoutButton navigation={navigation} />,
            headerStyle: { backgroundColor: '#004D40' },
            headerTintColor: '#fff',
          })}
        />
        <Stack.Screen 
          name="ServiceProviderDashboard" 
          component={ServiceProviderDashboardScreen} 
          options={({ navigation }) => ({
            title: 'Service Provider Dashboard',
            headerRight: () => <LogoutButton navigation={navigation} />,
            headerStyle: { backgroundColor: '#004D40' },
            headerTintColor: '#fff',
          })}
        />
        <Stack.Screen 
          name="BillingDashboard" 
          component={BillingDashboardScreen} 
          options={({ navigation }) => ({
            title: 'Billing Dashboard',
            headerRight: () => <LogoutButton navigation={navigation} />,
            headerStyle: { backgroundColor: '#004D40' },
            headerTintColor: '#fff',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;