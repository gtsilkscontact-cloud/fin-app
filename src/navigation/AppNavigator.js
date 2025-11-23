import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import BottomTabNavigator from './BottomTabNavigator';
import AddAccountScreen from '../screens/AddAccountScreen';
import AccountDetailScreen from '../screens/AccountDetailScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ManageCardGroupsScreen from '../screens/ManageCardGroupsScreen';
import EditCardGroupScreen from '../screens/EditCardGroupScreen';
import EditAccountScreen from '../screens/EditAccountScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="MainTabs"
                    component={BottomTabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AddAccount"
                    component={AddAccountScreen}
                    options={{ title: 'Add Account' }}
                />
                <Stack.Screen
                    name="AccountDetail"
                    component={AccountDetailScreen}
                    options={{ title: 'Account Details' }}
                />
                <Stack.Screen
                    name="AddTransaction"
                    component={AddTransactionScreen}
                    options={{ title: 'Add Transaction' }}
                />
                <Stack.Screen
                    name="ManageCardGroups"
                    component={ManageCardGroupsScreen}
                    options={{ title: 'Manage Card Groups' }}
                />
                <Stack.Screen
                    name="EditCardGroup"
                    component={EditCardGroupScreen}
                    options={{ title: 'Edit Card Group' }}
                />
                <Stack.Screen
                    name="EditAccount"
                    component={EditAccountScreen}
                    options={{ title: 'Edit Account' }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ title: 'Notifications' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
