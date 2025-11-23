import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import { calculateAvailableCredit, calculateUtilization, getCardsInGroup } from '../utils/CreditCalculator';

const { width } = Dimensions.get('window');

const CardsScreen = () => {
    const { accounts, transactions, cardGroups, deleteAccount, deleteCardGroup } = useContext(TransactionContext);
    const navigation = useNavigation();

    const calculateBalance = (accountId) => {
        const account = (accounts || []).find(a => a && a.id === accountId);
        if (!account) return 0;

        const accountTransactions = (transactions || []).filter(t => t && t.accountId === accountId);
        const totalIncome = accountTransactions
            .filter(t => {
                const type = t.type ? t.type.toLowerCase() : '';
                return type === 'income';
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = accountTransactions
            .filter(t => {
                const type = t.type ? t.type.toLowerCase() : '';
                return type === 'expense' || type === 'payment';
            })
            .reduce((sum, t) => sum + t.amount, 0);

        if (account.type === 'CREDIT_CARD') {
            // For Credit Cards, startingBalance is usually Initial Debt.
            // Current Debt = Initial Debt + Expenses - Payments (Income)
            // Available Credit = Credit Limit - Current Debt
            const currentDebt = (account.startingBalance || 0) + totalExpense - totalIncome;
            return (account.creditLimit || 0) - currentDebt;
        }

        // For Bank/Cash: Balance = Starting + Income - Expense
        return (account.startingBalance || 0) + totalIncome - totalExpense;
    };

    const handleDeleteAccount = (accountId, accountName) => {
        Alert.alert(
            'Delete Account',
            `Are you sure you want to delete "${accountName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteAccount(accountId)
                }
            ]
        );
    };

    const handleDeleteGroup = (groupId, groupName) => {
        Alert.alert(
            'Delete Card Group',
            `Are you sure you want to delete "${groupName}"? Cards will be ungrouped.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteCardGroup(groupId)
                }
            ]
        );
    };

    const renderCircularProgress = (percentage) => {
        return (
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
            </View>
        );
    };

    const renderCardGroup = (group) => {
        const cardsInGroup = getCardsInGroup(accounts || [], group.id);
        const cardIds = cardsInGroup.map(c => c.id);
        const availableCredit = calculateAvailableCredit(group.sharedCreditLimit, transactions || [], cardIds, group.startingBalance);
        const utilization = calculateUtilization(group.sharedCreditLimit, transactions || [], cardIds, group.startingBalance);

        return (
            <View key={group.id} style={styles.groupCard}>
                <View style={[styles.groupHeader, styles.gradientPurple]}>
                    <View style={styles.groupHeaderTop}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('EditCardGroup', { group })} style={{ marginRight: 15 }}>
                                <Text style={styles.deleteText}>✎</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteGroup(group.id, group.name)}>
                                <Text style={styles.deleteText}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.creditInfo}>
                        <View style={styles.creditLeft}>
                            <Text style={styles.creditLabel}>Available Credit</Text>
                            <Text style={styles.creditAmount}>₹{availableCredit.toLocaleString()}</Text>
                            <Text style={styles.creditTotal}>of ₹{group.sharedCreditLimit.toLocaleString()}</Text>
                        </View>
                        {renderCircularProgress(utilization)}
                    </View>
                </View>

                <View style={styles.groupCards}>
                    <Text style={styles.groupCardsTitle}>Cards in this group:</Text>
                    {cardsInGroup.map(card => (
                        <View key={card.id} style={styles.miniCard}>
                            <View>
                                <Text style={styles.miniCardName}>{card.name}</Text>
                                <Text style={styles.miniCardDigits}>****{card.last4Digits}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => navigation.navigate('EditAccount', { account: card })} style={{ marginRight: 10 }}>
                                    <Text style={styles.miniDeleteText}>✎</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteAccount(card.id, card.name)}>
                                    <Text style={styles.miniDeleteText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const getAccountTypeEmoji = (type) => {
        switch (type) {
            case 'BANK': return '🏦';
            case 'CREDIT_CARD': return '💳';
            case 'CASH': return '💵';
            default: return '📁';
        }
    };

    const renderIndividualAccount = (account) => {
        const balance = calculateBalance(account.id);
        const isCredit = account.type === 'CREDIT_CARD';

        let gradientStyle = styles.gradientBlue;
        if (account.type === 'BANK') gradientStyle = styles.gradientGreen;
        else if (account.type === 'CASH') gradientStyle = styles.gradientOrange;
        else if (account.type === 'CREDIT_CARD') gradientStyle = styles.gradientPurple;

        return (
            <View key={account.id} style={styles.accountCard}>
                <View style={[styles.accountCardInner, gradientStyle]}>
                    <View style={styles.accountCardHeader}>
                        <View>
                            <Text style={styles.accountType}>{getAccountTypeEmoji(account.type)} {account.type}</Text>
                            <Text style={styles.accountName}>{account.name}</Text>
                            {account.last4Digits && (
                                <Text style={styles.accountDigits}>****{account.last4Digits}</Text>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('EditAccount', { account })} style={{ marginRight: 15 }}>
                                <Text style={styles.deleteTextWhite}>✎</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteAccount(account.id, account.name)}>
                                <Text style={styles.deleteTextWhite}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.accountBalance}>
                        <Text style={styles.balanceLabel}>
                            {isCredit ? 'Available Credit' : 'Balance'}
                        </Text>
                        <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
                        {isCredit && account.creditLimit && (
                            <Text style={styles.balanceLimit}>of ₹{account.creditLimit.toLocaleString()}</Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const ungroupedAccounts = (accounts || []).filter(acc => !acc.cardGroup);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>💳 Card Groups</Text>
                {cardGroups && cardGroups.length > 0 ? (
                    cardGroups.map(group => renderCardGroup(group))
                ) : (
                    <Text style={styles.emptyText}>No card groups yet</Text>
                )}

                <Text style={styles.sectionTitle}>🏦 Individual Accounts</Text>
                {ungroupedAccounts.length > 0 ? (
                    ungroupedAccounts.map(account => renderIndividualAccount(account))
                ) : (
                    <Text style={styles.emptyText}>No individual accounts</Text>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddAccount')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContent: { padding: 16, paddingBottom: 80 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 15 },

    // Card Group Styles
    groupCard: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, overflow: 'hidden', elevation: 3 },
    groupHeader: { padding: 20 },
    groupHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    groupName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    deleteText: { fontSize: 20, color: '#fff' },
    creditInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    creditLeft: { flex: 1 },
    creditLabel: { fontSize: 12, color: '#e0d4ff', marginBottom: 5 },
    creditAmount: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 3 },
    creditTotal: { fontSize: 12, color: '#e0d4ff' },
    progressContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    progressText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

    groupCards: { padding: 15, backgroundColor: '#f9f9f9' },
    groupCardsTitle: { fontSize: 12, color: '#666', marginBottom: 10, fontWeight: '600' },
    miniCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
    miniCardName: { fontSize: 14, fontWeight: '600', color: '#333' },
    miniCardDigits: { fontSize: 12, color: '#999', marginTop: 2 },
    miniDeleteText: { fontSize: 18, color: '#f44336' },

    // Individual Account Styles
    accountCard: { marginBottom: 15 },
    accountCardInner: { borderRadius: 15, padding: 20, minHeight: 150, justifyContent: 'space-between', elevation: 3 },
    accountCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    accountType: { fontSize: 10, color: '#fff', opacity: 0.8, marginBottom: 5, fontWeight: '600', letterSpacing: 1 },
    accountName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    accountDigits: { fontSize: 12, color: '#fff', opacity: 0.8 },
    deleteTextWhite: { fontSize: 20, color: '#fff' },
    accountBalance: { marginTop: 15 },
    balanceLabel: { fontSize: 12, color: '#fff', opacity: 0.8, marginBottom: 5 },
    balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    balanceLimit: { fontSize: 12, color: '#fff', opacity: 0.8, marginTop: 3 },

    // Gradients (simulated with solid colors)
    gradientPurple: { backgroundColor: '#6200ee' },
    gradientBlue: { backgroundColor: '#1976d2' },
    gradientGreen: { backgroundColor: '#388e3c' },
    gradientOrange: { backgroundColor: '#f57c00' },

    emptyText: { textAlign: 'center', color: '#999', marginVertical: 20, fontSize: 14 },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200ee', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
});

export default CardsScreen;
