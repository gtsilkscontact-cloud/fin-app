import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import { getCurrentLocationWithArea } from '../utils/LocationHelper';
import CategoryPickerModal from '../components/CategoryPickerModal';
import { getCategoryDisplay } from '../utils/CategoryManager';

const TRANSACTION_TYPES = ["EXPENSE", "INCOME"];

const AddTransactionScreen = () => {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('EXPENSE');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    const { addTransaction, updateTransaction, accounts, customCategories, confirmTransaction } = useContext(TransactionContext);
    const navigation = useNavigation();
    const route = useRoute();
    const { accountId: accountIdFromRoute } = route.params || {};
    const prefill = route.params?.prefill;
    const editMode = route.params?.editMode;
    const transaction = route.params?.transaction;

    useEffect(() => {
        if (editMode && transaction) {
            // Pre-fill for edit mode
            setAmount(transaction.amount.toString());
            setType(transaction.type.toUpperCase());
            setNote(transaction.description || '');
            // Normalize category to ID string
            const categoryId = typeof transaction.category === 'object'
                ? transaction.category.id
                : transaction.category;
            setSelectedCategory(categoryId);
            if (transaction.accountId) setSelectedAccountId(transaction.accountId);
            if (transaction.location) setCurrentLocation(transaction.location);
        } else if (prefill) {
            // Pre-fill from pending transaction
            setAmount(prefill.amount.toString());
            setType(prefill.type.toUpperCase()); // Convert to uppercase for button matching
            // Use merchantName if available, otherwise use note
            setNote(prefill.merchantName || prefill.note || '');
            if (prefill.accountId) setSelectedAccountId(prefill.accountId);
            if (prefill.location) setCurrentLocation(prefill.location);
        } else if (accountIdFromRoute) {
            setSelectedAccountId(accountIdFromRoute);
        } else if (accounts && accounts.length > 0) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accountIdFromRoute, accounts, prefill, editMode, transaction]);

    // Fetch location on mount for new transactions
    useEffect(() => {
        if (!editMode && !prefill) {
            const fetchLocation = async () => {
                const loc = await getCurrentLocationWithArea();
                if (loc && (loc.area || loc.city)) {
                    // Format object to string: "Area, City - Pincode"
                    const parts = [];
                    if (loc.area) parts.push(loc.area);
                    if (loc.city) parts.push(loc.city);
                    if (loc.postalCode) parts.push(loc.postalCode);

                    const formattedLocation = parts.join(', ');
                    setCurrentLocation(formattedLocation);
                }
            };
            fetchLocation();
        }
    }, [editMode, prefill]);

    const handleSave = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        if (!selectedAccountId) {
            Alert.alert("Error", "Please select an account");
            return;
        }

        if (!selectedCategory) {
            Alert.alert("Error", "Please select a category");
            return;
        }

        setLoading(true);

        // Get location
        let locationString = currentLocation;
        if (!locationString) {
            const loc = await getCurrentLocationWithArea();
            if (loc && (loc.area || loc.city)) {
                const parts = [];
                if (loc.area) parts.push(loc.area);
                if (loc.city) parts.push(loc.city);
                if (loc.postalCode) parts.push(loc.postalCode);
                locationString = parts.join(', ');
            }
        }

        const newTransaction = {
            id: editMode ? transaction.id : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: parseFloat(amount),
            type: type.toLowerCase(),
            category: typeof selectedCategory === 'object' ? selectedCategory.id : selectedCategory,
            description: note,
            accountId: selectedAccountId,
            date: editMode ? transaction.date : new Date().toISOString().split('T')[0],
            location: editMode ? transaction.location : locationString,
            createdAt: editMode ? transaction.createdAt : new Date().toISOString()
        };

        if (editMode) {
            updateTransaction(newTransaction);
        } else {
            if (prefill && prefill.isPending) {
                confirmTransaction(prefill.id);
            }
            addTransaction(newTransaction);
        }

        setLoading(false);
        navigation.goBack();
    };

    const categoryDisplay = selectedCategory
        ? getCategoryDisplay(selectedCategory, customCategories)
        : null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {!accountIdFromRoute && accounts && accounts.length > 0 && (
                <>
                    <Text style={styles.label}>💳 Select Account</Text>
                    <View style={styles.accountSelector}>
                        {accounts.map(acc => (
                            <TouchableOpacity
                                key={acc.id}
                                style={[styles.accountButton, selectedAccountId === acc.id && styles.accountButtonSelected]}
                                onPress={() => setSelectedAccountId(acc.id)}
                            >
                                <Text style={[styles.accountText, selectedAccountId === acc.id && styles.accountTextSelected]}>
                                    {acc.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            <Text style={styles.label}>💰 Amount</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
            />

            <Text style={styles.label}>📊 Type</Text>
            <View style={styles.typeContainer}>
                {TRANSACTION_TYPES.map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.typeButton, type === t && styles.typeButtonSelected]}
                        onPress={() => {
                            setType(t);
                            setSelectedCategory(null); // Reset category when type changes
                        }}
                    >
                        <Text style={[styles.typeText, type === t && styles.typeTextSelected]}>
                            {t === 'INCOME' ? '💵 Income' : '💸 Expense'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>🏷️ Category</Text>
            <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryPicker(true)}
            >
                {categoryDisplay ? (
                    <View style={styles.categoryDisplay}>
                        <Text style={styles.categoryEmoji}>{categoryDisplay.emoji}</Text>
                        <Text style={styles.categoryName}>{categoryDisplay.name}</Text>
                    </View>
                ) : (
                    <Text style={styles.categoryPlaceholder}>Tap to select category</Text>
                )}
            </TouchableOpacity>

            {currentLocation && (
                <>
                    <Text style={styles.label}>📍 Location</Text>
                    <View style={styles.locationDisplay}>
                        <Text style={styles.locationText}>{currentLocation}</Text>
                    </View>
                </>
            )}

            <Text style={styles.label}>📝 Note (Optional)</Text>
            <TextInput
                style={[styles.input, styles.noteInput]}
                value={note}
                onChangeText={setNote}
                placeholder="Add details..."
                multiline
                numberOfLines={3}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>💾 {editMode ? 'Update Transaction' : 'Save Transaction'}</Text>}
            </TouchableOpacity>

            <CategoryPickerModal
                visible={showCategoryPicker}
                onClose={() => setShowCategoryPicker(false)}
                onSelectCategory={setSelectedCategory}
                type={type}
                customCategories={customCategories}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    label: { fontSize: 16, marginBottom: 8, color: '#333', fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
    noteInput: { height: 80, textAlignVertical: 'top' },
    accountSelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
    accountButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    accountButtonSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    accountText: { color: '#333', fontSize: 14 },
    accountTextSelected: { color: '#fff' },
    typeContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
    typeButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    typeButtonSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    typeText: { color: '#333', fontSize: 14, fontWeight: '600' },
    typeTextSelected: { color: '#fff' },
    categoryButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    categoryDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    categoryName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    categoryPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    locationDisplay: {
        backgroundColor: '#f0f9ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    locationText: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: '500',
    },
    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddTransactionScreen;
