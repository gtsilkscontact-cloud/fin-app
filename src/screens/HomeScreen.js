import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import SmsListener from '../components/SmsListener';

const HomeScreen = () => {
    const { accounts, transactions, isLoaded } = useContext(TransactionContext);
    const navigation = useNavigation();

    if (!isLoaded) {
        return (
            <View style={styles.center}>
                <Text>Loading data...</Text>
            </View>
        );
    }

    const calculateBalance = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;

        const accountTransactions = transactions.filter(t => t.accountId === accountId);
        const totalIncome = accountTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = accountTransactions
            .filter(t => t.type === 'expense' || t.type === 'payment')
            .reduce((sum, t) => sum + t.amount, 0);

        return account.startingBalance + totalIncome - totalExpense;
    };

    const totalBalance = accounts.reduce((sum, account) => sum + calculateBalance(account.id), 0);

    const renderAccountItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardType}>{item.type}</Text>
            </View>
            <Text style={styles.cardBalance}>₹ {calculateBalance(item.id).toFixed(2)}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SmsListener />
            <View style={styles.overview}>
                <Text style={styles.overviewLabel}>Total Balance</Text>
                <Text style={styles.overviewAmount}>₹ {totalBalance.toFixed(2)}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddAccount')}>
                    <Text style={styles.actionText}>+ Add Account</Text>
                </TouchableOpacity>

            </View>

            <FlatList
                data={accounts}
                keyExtractor={item => item.id}
                renderItem={renderAccountItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No accounts yet. Add one!</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overview: { backgroundColor: '#6200ee', padding: 20, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
    overviewLabel: { color: '#fff', fontSize: 16 },
    overviewAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
    actions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    actionButton: { backgroundColor: '#03dac6', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
    actionText: { color: '#000', fontWeight: 'bold' },
    list: { paddingBottom: 20 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    cardType: { fontSize: 12, color: '#666', backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    cardBalance: { fontSize: 20, color: '#333', marginTop: 5 },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
});

export default HomeScreen;
