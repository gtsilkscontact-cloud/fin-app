import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import CardsScreen from '../screens/CardsScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    paddingBottom: Math.max(insets.bottom, 4),
                    paddingTop: 4,
                    height: 56 + Math.max(insets.bottom, 4),
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    backgroundColor: '#fff'
                },
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
                name="Budgets"
                component={BudgetScreen}
                options={{
                    tabBarLabel: 'Budgets',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💰</Text>,
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
                name="Cards"
                component={CardsScreen}
                options={{
                    tabBarLabel: 'Cards',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
