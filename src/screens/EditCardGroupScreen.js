import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext } from 'react';
import TransactionContext from '../context/TransactionContext';

const EditCardGroupScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { group } = route.params;

    const { updateCardGroup } = useContext(TransactionContext);

    const [groupName, setGroupName] = useState(group.name);
    const [sharedLimit, setSharedLimit] = useState(group.sharedCreditLimit.toString());
    // Initialize available credit based on limit and starting balance (debt)
    const initialAvailable = group.sharedCreditLimit - (group.startingBalance || 0);
    const [availableCredit, setAvailableCredit] = useState(initialAvailable.toString());

    const handleSave = () => {
        if (!groupName.trim()) {
            Alert.alert("Error", "Please enter a group name");
            return;
        }
        if (!sharedLimit || isNaN(parseFloat(sharedLimit))) {
            Alert.alert("Error", "Please enter a valid shared credit limit");
            return;
        }
        if (isNaN(parseFloat(availableCredit))) {
            Alert.alert("Error", "Please enter a valid available credit amount");
            return;
        }

        const limit = parseFloat(sharedLimit);
        const available = parseFloat(availableCredit);

        if (available > limit) {
            Alert.alert("Error", "Available credit cannot be greater than the credit limit");
            return;
        }

        // startingBalance represents the initial used amount (debt)
        const startingBalance = limit - available;

        const updatedGroup = {
            ...group,
            name: groupName.trim(),
            sharedCreditLimit: limit,
            startingBalance: startingBalance,
        };

        updateCardGroup(updatedGroup);
        Alert.alert("Success", "Card group updated successfully!");
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
                <Text style={styles.title}>Edit Card Group</Text>

                <Text style={styles.label}>Group Name</Text>
                <TextInput
                    style={styles.input}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="e.g. Axis Bank Cards"
                />

                <Text style={styles.label}>Shared Credit Limit</Text>
                <TextInput
                    style={styles.input}
                    value={sharedLimit}
                    onChangeText={setSharedLimit}
                    placeholder="e.g. 195000"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Current Available Credit</Text>
                <TextInput
                    style={styles.input}
                    value={availableCredit}
                    onChangeText={setAvailableCredit}
                    placeholder="e.g. 180000"
                    keyboardType="numeric"
                />

                <Text style={styles.helpText}>
                    💡 Note: Changing the credit limit will affect all cards in this group.
                    "Current Available Credit" is used to calculate the initial used amount.
                </Text>

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
    helpText: { fontSize: 13, color: '#666', marginBottom: 20, fontStyle: 'italic' },
    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 15 },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    cancelButton: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
    cancelButtonText: { color: '#333', fontSize: 18, fontWeight: '600' },
});

export default EditCardGroupScreen;
