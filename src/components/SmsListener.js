import React, { useEffect, useContext } from 'react';
import { View, Text, Platform, Alert } from 'react-native';
import * as SMS from '@maniac-tech/react-native-expo-read-sms';
import * as Location from 'expo-location';
import TransactionContext from '../context/TransactionContext';
import { getCurrentLocationWithArea } from '../utils/LocationHelper';
import { parseAxisBankSms } from '../utils/SmsParser';

const SmsListener = () => {
    const { addTransaction, accounts } = useContext(TransactionContext);

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const startListening = async () => {
            const hasPermission = await SMS.requestReadSMSPermission();
            if (hasPermission) {
                SMS.startReadSMS((status, sms, error) => {
                    if (status === "success" && sms) {
                        processSms(sms.body, sms.address);
                    }
                });
            }
        };

        // startListening(); // Commented out to prevent crashes in Expo Go if native module is missing or incompatible

        // Mock implementation for Expo Go / Development
        // In a real build, you would uncomment the above and handle the SMS object.

        return () => {
            if (Platform.OS === 'android') {
                // SMS.stopReadSMS();
            }
        };
    }, []);

    const processSms = async (smsBody, sender) => {
        // Filter by sender (heuristic)
        if (!sender.toUpperCase().includes("AXISBK")) return;

        const parsedData = parseAxisBankSms(smsBody);
        if (!parsedData) return;

        const { amount, type, last4Digits, date, description } = parsedData;

        // Find matching account
        let accountId = accounts.length > 0 ? accounts[0].id : null;
        if (last4Digits) {
            const matchedAccount = accounts.find(a => a.last4Digits === last4Digits);
            if (matchedAccount) {
                accountId = matchedAccount.id;
            }
        }

        if (!accountId) return; // Should not happen if accounts exist, but safety check

        const location = await getCurrentLocationWithArea();

        const newTransaction = {
            id: Date.now().toString(),
            accountId,
            amount,
            type,
            category: 'SMS Auto',
            note: description,
            date,
            location
        };

        addTransaction(newTransaction);
        Alert.alert("New Transaction", `Auto-added ${type} of ₹${amount} to account ending in ${last4Digits || 'XX'}`);
    };

    return null; // Invisible component
};

export default SmsListener;
