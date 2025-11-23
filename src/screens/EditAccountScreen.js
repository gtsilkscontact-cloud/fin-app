import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';

const EditAccountScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { account } = route.params;
    const { updateAccount } = useContext(TransactionContext);

    const [name, setName] = useState(account.name);
    const [startingBalance, setStartingBalance] = useState(account.startingBalance.toString());
    const [creditLimit, setCreditLimit] = useState(account.creditLimit ? account.creditLimit.toString() : '');
    const [last4Digits, setLast4Digits] = useState(account.last4Digits || '');

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter an account name");
            return;
        }
        if (isNaN(parseFloat(startingBalance))) {
            Alert.alert("Error", "Please enter a valid starting balance");
            return;
        }

        const updatedAccount = {
            ...account,
            name: name.trim(),
            startingBalance: parseFloat(startingBalance),
            last4Digits: last4Digits.trim() || null,
            creditLimit: account.type === 'CREDIT_CARD' && creditLimit ? parseFloat(creditLimit) : account.creditLimit
        };

        updateAccount(updatedAccount);
        Alert.alert("Success", "Account updated successfully!");
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>Edit Account</Text>

                <Text style={styles.label}>Account Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. HDFC Salary"
                />

                {!account.cardGroup && (
                    <>
                        <Text style={styles.label}>Starting Balance</Text>
                        <TextInput
                            style={styles.input}
                            value={startingBalance}
                            onChangeText={setStartingBalance}
                            placeholder="0.00"
                            keyboardType="numeric"
                        />
                    </>
                )}

                {account.type === 'CREDIT_CARD' && !account.cardGroup && (
                    <>
                        <Text style={styles.label}>Credit Limit</Text>
                        <TextInput
                            style={styles.input}
                            value={creditLimit}
                            onChangeText={setCreditLimit}
                            placeholder="Optional"
                            keyboardType="numeric"
                        />
                    </>
                )}

                <Text style={styles.label}>Last 4 Digits</Text>
                <TextInput
                    style={styles.input}
                    value={last4Digits}
                    onChangeText={setLast4Digits}
                    placeholder="e.g. 5516"
                    keyboardType="numeric"
                    maxLength={4}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 15 },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    cancelButton: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
    cancelButtonText: { color: '#333', fontSize: 18, fontWeight: '600' },
});

export default EditAccountScreen;
