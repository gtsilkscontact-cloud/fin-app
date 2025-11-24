import React, { useState, useContext, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import TransactionContext from '../context/TransactionContext';
import { getCategoryDisplay } from '../utils/CategoryManager';
import AmountDisplay from '../components/AmountDisplay';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../utils/DesignTokens';

const TransactionsScreen = () => {
    const { transactions, accounts, customCategories, deleteTransaction } = useContext(TransactionContext);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('ALL'); // ALL, INCOME, EXPENSE
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryFilters, setShowCategoryFilters] = useState(false);
    const [dateFilter, setDateFilter] = useState('ALL'); // ALL, CUSTOM
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Get unique categories from transactions
    const usedCategories = useMemo(() => {
        return [...new Set(
            (transactions || [])
                .filter(t => t.category)
                .map(t => {
                    const cat = t.category;
                    return typeof cat === 'object' ? cat.id : cat;
                })
        )].filter(Boolean);
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return (transactions || []).filter(t => {
            // Filter by type
            if (selectedType !== 'ALL') {
                if (selectedType === 'INCOME' && (t.type !== 'income' && t.type !== 'INCOME')) return false;
                if (selectedType === 'EXPENSE' && (t.type !== 'expense' && t.type !== 'EXPENSE')) return false;
            }

            // Filter by date range
            if (dateFilter === 'CUSTOM') {
                const tDate = new Date(t.date);
                const start = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
                const end = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());
                const d = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
                if (d < start || d > end) return false;
            }

            // Filter by category
            if (selectedCategory) {
                const tCatId = typeof t.category === 'object' ? t.category.id : t.category;
                if (tCatId !== selectedCategory) return false;
            }

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const category = getCategoryDisplay(t.category, customCategories);
                const account = (accounts || []).find(a => a.id === t.accountId);

                return (
                    (t.description && t.description.toLowerCase().includes(query)) ||
                    (category.name && category.name.toLowerCase().includes(query)) ||
                    (account && account.name.toLowerCase().includes(query)) ||
                    t.amount.toString().includes(query)
                );
            }

            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, selectedType, selectedCategory, searchQuery, accounts, customCategories, dateFilter, customStartDate, customEndDate]);

    const handleDelete = (transactionId) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTransaction(transactionId)
                }
            ]
        );
    };

    const renderTransaction = ({ item }) => {
        const account = (accounts || []).find(a => a.id === item.accountId);
        const category = getCategoryDisplay(item.category, customCategories);
        const isIncome = item.type === 'income' || item.type === 'INCOME';

        return (
            <View style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        {item.merchantName && (
                            <Text style={styles.merchantName}>{item.merchantName}</Text>
                        )}
                        <View style={styles.metaRow}>
                            <Text style={styles.accountName}>
                                {account ? account.name : 'Unknown'}
                            </Text>
                            <Text style={styles.metaDot}> • </Text>
                            <Text style={styles.date}>{item.date}</Text>
                        </View>
                        {item.location && (
                            <Text style={styles.locationText} numberOfLines={1}>📍 {item.location}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <AmountDisplay
                        amount={item.amount}
                        type={isIncome ? 'income' : 'expense'}
                        size="small"
                        showSign={true}
                    />
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddTransaction', {
                            editMode: true,
                            transaction: item
                        })} style={styles.editButton}>
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderFilters = () => {
        return (
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedType === 'ALL' && styles.filterChipActive]}
                        onPress={() => setSelectedType('ALL')}
                    >
                        <Text style={styles.filterEmoji}>🌟</Text>
                        <Text style={[styles.filterText, selectedType === 'ALL' && styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedType === 'INCOME' && styles.filterChipActive]}
                        onPress={() => setSelectedType('INCOME')}
                    >
                        <Text style={styles.filterEmoji}>💵</Text>
                        <Text style={[styles.filterText, selectedType === 'INCOME' && styles.filterTextActive]}>Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedType === 'EXPENSE' && styles.filterChipActive]}
                        onPress={() => setSelectedType('EXPENSE')}
                    >
                        <Text style={styles.filterEmoji}>💸</Text>
                        <Text style={[styles.filterText, selectedType === 'EXPENSE' && styles.filterTextActive]}>Expense</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Date Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, dateFilter === 'ALL' && styles.filterChipActive]}
                        onPress={() => setDateFilter('ALL')}
                    >
                        <Text style={styles.filterEmoji}>📅</Text>
                        <Text style={[styles.filterText, dateFilter === 'ALL' && styles.filterTextActive]}>All Time</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, dateFilter === 'CUSTOM' && styles.filterChipActive]}
                        onPress={() => setDateFilter('CUSTOM')}
                    >
                        <Text style={styles.filterEmoji}>🗓️</Text>
                        <Text style={[styles.filterText, dateFilter === 'CUSTOM' && styles.filterTextActive]}>Custom Range</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Custom Date Range */}
                {dateFilter === 'CUSTOM' && (
                    <View style={styles.customDateRow}>
                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            onPress={() => setShowStartPicker(true)}
                        >
                            <Text style={styles.dateLbl}>From:</Text>
                            <Text style={styles.dateVal}>{customStartDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            onPress={() => setShowEndPicker(true)}
                        >
                            <Text style={styles.dateLbl}>To:</Text>
                            <Text style={styles.dateVal}>{customEndDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Date Pickers */}
                {showStartPicker && (
                    <DateTimePicker
                        value={customStartDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowStartPicker(Platform.OS === 'ios');
                            if (selectedDate) setCustomStartDate(selectedDate);
                        }}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={customEndDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowEndPicker(Platform.OS === 'ios');
                            if (selectedDate) setCustomEndDate(selectedDate);
                        }}
                    />
                )}

                {(showCategoryFilters || searchQuery.length > 0) && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.categoryFilterChip,
                                selectedCategory === null && styles.categoryFilterChipActive
                            ]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <Text style={[
                                styles.categoryFilterText,
                                selectedCategory === null && styles.categoryFilterTextActive
                            ]}>
                                All Categories
                            </Text>
                        </TouchableOpacity>
                        {(() => {
                            const renderedNames = new Set();
                            return usedCategories.map(catId => {
                                const cat = getCategoryDisplay(catId, customCategories);
                                if (renderedNames.has(cat.name)) return null;
                                renderedNames.add(cat.name);

                                return (
                                    <TouchableOpacity
                                        key={catId}
                                        style={[
                                            styles.categoryFilterChip,
                                            selectedCategory === catId && styles.categoryFilterChipActive
                                        ]}
                                        onPress={() => setSelectedCategory(catId)}
                                    >
                                        <Text style={styles.categoryFilterEmoji}>{cat.emoji}</Text>
                                        <Text style={[
                                            styles.categoryFilterText,
                                            selectedCategory === catId && styles.categoryFilterTextActive
                                        ]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            });
                        })()}
                    </ScrollView>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Transactions</Text>
                <Text style={styles.headerSubtitle}>{filteredTransactions.length} total</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        if (text.length > 0) setShowCategoryFilters(true);
                    }}
                />
            </View>

            {renderFilters()}

            <View style={styles.listHeader}>
                <Text style={styles.listCount}>{filteredTransactions.length} transactions</Text>
                {!showCategoryFilters && searchQuery.length === 0 && (
                    <TouchableOpacity onPress={() => setShowCategoryFilters(true)}>
                        <Text style={styles.filterLink}>Filter by Category</Text>
                    </TouchableOpacity>
                )}
                {showCategoryFilters && searchQuery.length === 0 && (
                    <TouchableOpacity onPress={() => {
                        setShowCategoryFilters(false);
                        setSelectedCategory(null);
                    }}>
                        <Text style={styles.filterLink}>Hide Filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        padding: Spacing.xl,
        paddingTop: Spacing.md,
    },
    headerTitle: {
        fontSize: Typography.xxxl,
        fontWeight: Typography.bold,
        color: Colors.textPrimary
    },
    headerSubtitle: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    searchContainer: { padding: Spacing.lg, paddingBottom: Spacing.sm },
    searchInput: {
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        fontSize: Typography.md,
        ...Shadows.sm,
    },
    filterContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, flexDirection: 'row' },
    categoryFilterContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, flexDirection: 'row' },
    customDateRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md },
    datePickerBtn: { flex: 1, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, ...Shadows.sm },
    dateLbl: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
    dateVal: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.pill,
        marginRight: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.gray200,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary
    },
    filterEmoji: { marginRight: Spacing.sm, fontSize: 16 },
    filterText: { color: Colors.textPrimary, fontWeight: Typography.semibold },
    filterTextActive: { color: Colors.textInverse },
    categoryFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryFilterChipActive: { backgroundColor: '#e0e0e0', borderColor: '#999' },
    categoryFilterEmoji: { marginRight: 6, fontSize: 14 },
    categoryFilterText: { color: '#666', fontSize: 13 },
    categoryFilterTextActive: { color: '#333', fontWeight: 'bold' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8, alignItems: 'center' },
    listCount: { color: '#666', fontSize: 14 },
    filterLink: { color: '#6200ee', fontWeight: '600', fontSize: 14 },
    listContent: { padding: 16, paddingTop: 0 },
    transactionCard: {
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...Shadows.sm,
    },
    transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    categoryEmoji: { fontSize: 24 },
    transactionInfo: { flex: 1 },
    categoryName: {
        fontSize: Typography.md,
        fontWeight: Typography.semibold,
        color: Colors.textPrimary
    },
    merchantName: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    accountName: {
        fontSize: Typography.xs,
        color: Colors.textTertiary
    },
    metaDot: {
        fontSize: Typography.xs,
        color: Colors.textTertiary,
    },
    date: {
        fontSize: Typography.xs,
        color: Colors.textTertiary,
    },
    locationText: {
        fontSize: Typography.xs,
        color: Colors.success,
        marginTop: 2,
    },
    transactionRight: { alignItems: 'flex-end' },
    actionButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    editButton: { padding: Spacing.xs },
    editIcon: { fontSize: 16 },
    deleteButton: { padding: Spacing.xs },
    deleteIcon: { fontSize: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', fontSize: 16 },
});

export default TransactionsScreen;
