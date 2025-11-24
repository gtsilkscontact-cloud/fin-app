import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
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

    const GlassTabButton = ({ children, onPress, accessibilityState, label }) => {
        const focused = accessibilityState ? accessibilityState.selected : false;
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor: focused ? 'rgba(98, 0, 238, 0.1)' : 'transparent',
                    borderWidth: focused ? 1 : 0,
                    borderColor: 'rgba(98, 0, 238, 0.2)',
                }}>
                    {children}
                    {focused && (
                        <Text style={{
                            marginLeft: 8,
                            color: '#6200ee',
                            fontWeight: '600',
                            fontSize: 14
                        }}>
                            {label}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    paddingBottom: Math.max(insets.bottom, 4),
                    paddingTop: 4,
                    height: 64 + Math.max(insets.bottom, 4),
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    backgroundColor: '#fff',
                    elevation: 0,
                },
                headerShown: false,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarButton: (props) => <GlassTabButton {...props} label="Home"><Text style={{ fontSize: 24 }}>🏠</Text></GlassTabButton>,
                }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                    tabBarButton: (props) => <GlassTabButton {...props} label="Trans"><Text style={{ fontSize: 24 }}>📝</Text></GlassTabButton>,
                }}
            />
            <Tab.Screen
                name="Budgets"
                component={BudgetScreen}
                options={{
                    tabBarButton: (props) => <GlassTabButton {...props} label="Budget"><Text style={{ fontSize: 24 }}>💰</Text></GlassTabButton>,
                }}
            />
            <Tab.Screen
                name="Analysis"
                component={AnalysisScreen}
                options={{
                    tabBarButton: (props) => <GlassTabButton {...props} label="Stats"><Text style={{ fontSize: 24 }}>📊</Text></GlassTabButton>,
                }}
            />
            <Tab.Screen
                name="Cards"
                component={CardsScreen}
                options={{
                    tabBarButton: (props) => <GlassTabButton {...props} label="Cards"><Text style={{ fontSize: 24 }}>💳</Text></GlassTabButton>,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
