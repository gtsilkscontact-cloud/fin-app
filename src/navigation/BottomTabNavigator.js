import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                    tabBarLabel: 'Transactions',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💳</Text>,
                }}
            />
            <Tab.Screen
                name="Analysis"
                component={AnalysisScreen}
                options={{
                    tabBarLabel: 'Analysis',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
                }}
            />
            <Tab.Screen
                name="Details"
                component={DetailsScreen}
                options={{
                    tabBarLabel: 'Details',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
