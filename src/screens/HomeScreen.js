import React, { useContext, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import SmsListener from '../components/SmsListener';
import { getCategoryDisplay } from '../utils/CategoryManager';
import GradientCard from '../components/GradientCard';
import StatCard from '../components/StatCard';
import AccountFilterDropdown from '../components/AccountFilterDropdown';
import { calculateAvailableCredit, getCardsInGroup } from '../utils/CreditCalculator';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../utils/DesignTokens';

const HomeScreen = () => {
    const { accounts, transactions, isLoaded, customCategories, cardGroups } = useContext(TransactionContext);
    const navigation = useNavigation();
    const smsListenerRef = useRef(null);
    const [accountFilter, setAccountFilter] = useState('ALL'); // ALL, BANK, CASH, CREDIT_CARD

    if (!isLoaded) {
        return (
            <View style={styles.center}>
                <Text>Loading data...</Text>
            </View>
        );
    }

    const calculateBalance = (account) => {
        const accountTransactions = (transactions || []).filter(t => t && t.accountId === account.id);
        const totalIncome = accountTransactions
            .filter(t => t.type === 'income' || t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = accountTransactions
            .filter(t => t.type === 'expense' || t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);

        if (account.type === 'CREDIT_CARD') {
            const currentDebt = (account.startingBalance || 0) + totalExpense - totalIncome;
            return -currentDebt;
        } else {
            return (account.startingBalance || 0) + totalIncome - totalExpense;
        }
    };

    // Calculate Available Limit for a Credit Card Account
    const calculateAvailableLimit = (account) => {
        if (account.type !== 'CREDIT_CARD') return 0;

        // If part of a group, we need group limit and group debt
        if (account.cardGroup) {
            const group = (cardGroups || []).find(g => g.id === account.cardGroup);
            if (!group) return 0;

            // Use shared calculator
            const cardIds = getCardsInGroup(accounts, group.id).map(c => c.id);
            return calculateAvailableCredit(group.sharedCreditLimit, transactions, cardIds, group.startingBalance);
        }

        // Individual card
        const accountTransactions = (transactions || []).filter(t => t && t.accountId === account.id);
        const spent = accountTransactions.reduce((sum, t) => {
            const type = t.type ? t.type.toLowerCase() : '';
            if (type === 'expense') return sum + t.amount;
            if (type === 'payment') return sum - t.amount;
            return sum;
        }, 0);

        const currentDebt = (account.startingBalance || 0) + spent;
        return (account.creditLimit || 0) - currentDebt;
    };

    // Calculate Available Limit for a Card Group
    const calculateGroupAvailableLimit = (groupId) => {
        const group = (cardGroups || []).find(g => g.id === groupId);
        if (!group) return 0;

        const cardIds = getCardsInGroup(accounts, groupId).map(c => c.id);
        return calculateAvailableCredit(group.sharedCreditLimit, transactions, cardIds, group.startingBalance);
    };

    // Filter accounts based on selected filter
    const getFilteredAccounts = () => {
        if (accountFilter === 'ALL') return accounts || [];
        if (['BANK', 'CASH', 'CREDIT_CARD'].includes(accountFilter)) {
            return (accounts || []).filter(account => account.type === accountFilter);
        }

        // Check if filter is a Group ID
        const isGroup = (cardGroups || []).some(g => g.id === accountFilter);
        if (isGroup) {
            return (accounts || []).filter(account => account.cardGroup === accountFilter);
        }

        // Assume specific Account ID
        return (accounts || []).filter(account => account.id === accountFilter);
    };

    const filteredAccounts = getFilteredAccounts();

    // Calculate balances and limits based on filter type
    let mainDisplayAmount = 0;
    let subtitleText = null;
    let isCreditView = false;

    if (accountFilter === 'CREDIT_CARD') {
        isCreditView = true;
        let totalAvailable = 0;
        let totalLimit = 0;
        const processedGroups = new Set();

        (accounts || []).filter(a => a.type === 'CREDIT_CARD').forEach(acc => {
            if (acc.cardGroup) {
                if (!processedGroups.has(acc.cardGroup)) {
                    processedGroups.add(acc.cardGroup);
                    const group = cardGroups.find(g => g.id === acc.cardGroup);
                    if (group) {
                        totalLimit += group.sharedCreditLimit || 0;
                        totalAvailable += calculateGroupAvailableLimit(acc.cardGroup);
                    }
                }
            } else {
                totalLimit += acc.creditLimit || 0;
                totalAvailable += calculateAvailableLimit(acc);
            }
        });

        mainDisplayAmount = totalAvailable;
        subtitleText = `Total Credit Limit: ₹${totalLimit.toLocaleString('en-IN')}`;

    } else if ((cardGroups || []).some(g => g.id === accountFilter)) {
        // Specific Group
        isCreditView = true;
        const group = cardGroups.find(g => g.id === accountFilter);
        if (group) {
            mainDisplayAmount = calculateGroupAvailableLimit(accountFilter);
            subtitleText = `Credit Limit: ₹${(group.sharedCreditLimit || 0).toLocaleString('en-IN')}`;
        }

    } else {
        // Specific Account (if Credit Card) or Non-Credit Filters
        const account = (accounts || []).find(a => a.id === accountFilter);

        if (account && account.type === 'CREDIT_CARD') {
            isCreditView = true;
            mainDisplayAmount = calculateAvailableLimit(account);
            subtitleText = `Credit Limit: ₹${(account.creditLimit || 0).toLocaleString('en-IN')}`;
        } else {
            // Standard Balance Calculation (Net Worth, Bank, Cash)
            mainDisplayAmount = filteredAccounts.reduce((sum, acc) => sum + calculateBalance(acc), 0);
        }
    }

    // Generate Dropdown Options
    const getDropdownOptions = () => {
        const options = [];

        // 1. All Accounts Option
        options.push({
            title: 'Global',
            data: [
                { label: 'All Accounts', value: 'ALL', icon: '🌍' }
            ]
        });

        // 2. Banks
        const bankAccounts = (accounts || []).filter(a => a.type === 'BANK');
        if (bankAccounts.length > 0) {
            options.push({
                title: 'Bank Accounts',
                data: bankAccounts.map(a => ({
                    label: a.name,
                    value: a.id,
                    icon: '🏦',
                    subtitle: `₹${calculateBalance(a).toLocaleString('en-IN')}`
                }))
            });
        }

        // 3. Credit Cards (Groups & Individual)
        const creditCards = (accounts || []).filter(a => a.type === 'CREDIT_CARD');
        if (creditCards.length > 0) {
            const ccOptions = [];
            const processedGroups = new Set();

            // Add Groups first
            (cardGroups || []).forEach(group => {
                const limit = calculateGroupAvailableLimit(group.id);
                ccOptions.push({
                    label: `${group.name} (Group)`,
                    value: group.id,
                    icon: '🗂️',
                    subtitle: `Avail: ₹${limit.toLocaleString('en-IN')}`
                });
                processedGroups.add(group.id);
            });

            // Add Individual Cards (ONLY if not in a group)
            creditCards.forEach(card => {
                if (!card.cardGroup) {
                    const limit = calculateAvailableLimit(card);
                    ccOptions.push({
                        label: card.name,
                        value: card.id,
                        icon: '💳',
                        subtitle: `Avail: ₹${limit.toLocaleString('en-IN')}`
                    });
                }
            });

            if (ccOptions.length > 0) {
                options.push({
                    title: 'Credit Cards',
                    data: ccOptions
                });
            }
        }

        // 4. Cash
        const cashAccounts = (accounts || []).filter(a => a.type === 'CASH');
        if (cashAccounts.length > 0) {
            options.push({
                title: 'Cash',
                data: cashAccounts.map(a => ({
                    label: a.name,
                    value: a.id,
                    icon: '💵',
                    subtitle: `₹${calculateBalance(a).toLocaleString('en-IN')}`
                }))
            });
        }

        return options;
    };

    // This month's data
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Get account IDs from filtered accounts
    const filteredAccountIds = filteredAccounts.map(acc => acc.id);

    const thisMonthTransactions = (transactions || []).filter(t => {
        if (!t || !t.date) return false;
        const tDate = new Date(t.date);
        const isThisMonth = tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
        // Filter by account if not 'ALL'
        const matchesAccountFilter = accountFilter === 'ALL' || filteredAccountIds.includes(t.accountId);
        return isThisMonth && matchesAccountFilter;
    });

    const thisMonthIncome = thisMonthTransactions
        .filter(t => t.type === 'income' || t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpense = thisMonthTransactions
        .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment')
        .reduce((sum, t) => sum + t.amount, 0);

    const savings = thisMonthIncome - thisMonthExpense;

    // Recent Transactions
    const recentTransactions = (transactions || [])
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // Get greeting based on time
    const getGreeting = () => {
        const hour = now.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <SmsListener ref={smsListenerRef} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modern Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
                        <Text style={styles.date}>{formatDate()}</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
                            <Text style={styles.icon}>🔔</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Balance Card with Gradient */}
                <GradientCard colors={Colors.gradientPrimary} style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>
                        {isCreditView ? '💳 Available Credit' : '💰 Total Balance'}
                    </Text>

                    {/* Account Filter Dropdown */}
                    <View style={styles.filterContainer}>
                        <AccountFilterDropdown
                            options={getDropdownOptions()}
                            selectedValue={accountFilter}
                            onSelect={setAccountFilter}
                        />
                    </View>

                    <Text style={styles.balanceAmount}>
                        {mainDisplayAmount < 0 ? '-' : ''}₹{Math.abs(mainDisplayAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    {subtitleText && (
                        <Text style={styles.availableLimitText}>
                            {subtitleText}
                        </Text>
                    )}
                </GradientCard>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <StatCard
                        icon="📈"
                        label="Income"
                        value={`₹${thisMonthIncome.toLocaleString('en-IN')}`}
                        type="success"
                    />
                    <View style={{ width: Spacing.md }} />
                    <StatCard
                        icon="📉"
                        label="Expense"
                        value={`₹${thisMonthExpense.toLocaleString('en-IN')}`}
                        type="danger"
                    />
                    <View style={{ width: Spacing.md }} />
                    <StatCard
                        icon="💎"
                        label="Savings"
                        value={`₹${savings.toLocaleString('en-IN')}`}
                        type="info"
                    />
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.transactionsList}>
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map(item => {
                            const category = getCategoryDisplay(item.category, customCategories);
                            return (
                                <View key={item.id} style={styles.transactionCard}>
                                    <View style={styles.transactionLeft}>
                                        <View style={styles.iconCircle}>
                                            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                        </View>
                                        <View style={styles.transactionInfo}>
                                            <Text style={styles.categoryName}>{category.name}</Text>
                                            {item.merchantName && (
                                                <Text style={styles.merchantName}>{item.merchantName}</Text>
                                            )}
                                            <Text style={styles.transactionDate}>{item.date}</Text>
                                        </View>
                                    </View>
                                    <Text style={[
                                        styles.transactionAmount,
                                        item.type === 'INCOME' || item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                                    ]}>
                                        {item.type === 'INCOME' || item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>No recent transactions</Text>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.xl,
        paddingTop: Spacing.md,
    },
    greeting: {
        fontSize: Typography.xxxl,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    date: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    icon: {
        fontSize: 20,
    },
    balanceCard: {
        margin: Spacing.lg,
        marginTop: Spacing.md,
        padding: Spacing.xxl,
        alignItems: 'center',
        position: 'relative', // Ensure absolute children are relative to this
    },
    balanceLabel: {
        color: Colors.textInverse,
        fontSize: Typography.base,
        marginBottom: Spacing.sm,
        fontWeight: Typography.semibold,
        marginTop: Spacing.lg, // Add space for the dropdown
    },
    filterContainer: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        zIndex: 10,
    },
    balanceAmount: {
        color: Colors.textInverse,
        fontSize: Typography.massive,
        fontWeight: Typography.bold,
        letterSpacing: -0.5,
    },
    availableLimitText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        marginTop: Spacing.xs,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    seeAllText: {
        color: Colors.primary,
        fontWeight: Typography.semibold,
        fontSize: Typography.base,
    },
    transactionsList: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    categoryEmoji: {
        fontSize: 24,
    },
    transactionInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: Typography.md,
        fontWeight: Typography.semibold,
        color: Colors.textPrimary,
    },
    merchantName: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    transactionDate: {
        fontSize: Typography.xs,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
    },
    incomeAmount: {
        color: Colors.success,
    },
    expenseAmount: {
        color: Colors.danger,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        marginTop: Spacing.xl,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        right: Spacing.xl,
        bottom: Spacing.xl,
        width: 60,
        height: 60,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.xl,
    },
    fabText: {
        color: Colors.textInverse,
        fontSize: 32,
        fontWeight: Typography.bold,
    },
});

export default HomeScreen;
