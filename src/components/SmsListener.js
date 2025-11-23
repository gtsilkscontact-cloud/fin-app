import React, { useEffect, useContext } from 'react';
import { View, Text, Platform, Alert } from 'react-native';
import * as SMS from '@maniac-tech/react-native-expo-read-sms';
import * as Notifications from 'expo-notifications';
import TransactionContext from '../context/TransactionContext';
import { getCurrentLocationWithArea } from '../utils/LocationHelper';
import { parseAxisBankSms } from '../utils/SmsParser';

const SmsListener = () => {
    const { addPendingTransaction, accounts } = useContext(TransactionContext);

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

        // startListening(); // Commented out for Expo Go safety. Uncomment for build.

        // Mock SMS for testing (Triggered once on mount for demo purposes if needed, or remove)
        // setTimeout(() => {
        //    processSms("Rs. 500.00 spent on AXIS Bank Credit Card XX1234 at STARBUCKS on 23-11-2025.", "AXISBK");
        // }, 5000);

        return () => {
            if (Platform.OS === 'android') {
                // SMS.stopReadSMS();
            }
        };
    }, []);

    const processSms = async (smsBody, sender) => {
        // Filter by sender (heuristic)
        if (!sender.toUpperCase().includes("AXISBK") && !sender.toUpperCase().includes("HDFC")) return;

        const parsedData = parseAxisBankSms(smsBody);
        if (!parsedData) return;

        const { amount, type, last4Digits, date, description } = parsedData;

        // Find matching account
        let accountId = null;
        if (last4Digits) {
            const matchedAccount = accounts.find(a => a.last4Digits === last4Digits);
            if (matchedAccount) {
                accountId = matchedAccount.id;
            }
        }

        const location = await getCurrentLocationWithArea();

        const newTransaction = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            accountId, // Can be null if not found, user will select in AddTransaction
            amount,
            type,
            category: 'Uncategorized', // Default for pending
            note: description,
            date,
            location,
            originalSms: smsBody
        };

        addPendingTransaction(newTransaction);

        // Trigger Local Notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "New Transaction Detected",
                body: `₹${amount} at ${description || 'Unknown'}. Tap to categorize.`,
                data: { transactionId: newTransaction.id },
            },
            trigger: null, // Immediate
        });
    };

    return null;
};

export default SmsListener;
