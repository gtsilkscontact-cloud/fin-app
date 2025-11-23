import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import AddAccountScreen from '../screens/AddAccountScreen';
import AccountDetailScreen from '../screens/AccountDetailScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'My Finance' }} />
                <Stack.Screen name="AddAccount" component={AddAccountScreen} options={{ title: 'Add Account' }} />
                <Stack.Screen name="AccountDetail" component={AccountDetailScreen} options={{ title: 'Account Details' }} />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
