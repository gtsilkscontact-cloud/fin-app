import React, { useEffect, useContext, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import ReadSms from '@maniac-tech/react-native-expo-read-sms';
import * as Notifications from 'expo-notifications';
import TransactionContext from '../context/TransactionContext';
import { parseAxisBankSms } from '../utils/SmsParser';
import { getCurrentLocationWithArea } from '../utils/LocationHelper';


const SmsListener = () => {
    const { addPendingTransaction, accounts, transactions, pendingTransactions } = useContext(TransactionContext);
    const [processedSmsIds, setProcessedSmsIds] = useState(new Set());

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        // Start real-time SMS listener
        startSmsListener();

        // Cleanup on unmount
        return () => {
            stopSmsListener();
        };
    }, []);

    const startSmsListener = async () => {
        try {
            // Check permissions first
            const hasPermission = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.READ_SMS
            );

            if (!hasPermission) {
                console.log('SMS permission not granted. Please enable in settings.');
                return;
            }

            console.log('Starting real-time SMS listener...');

            // Start listening for incoming SMS
            ReadSms.startReadSMS(
                async (status, sms, error) => {
                    if (status === 'success') {
                        try {
                            const smsData = JSON.parse(sms);
                            const { address, body } = smsData;

                            console.log('New SMS received from:', address);
                            await handleIncomingSms(address, body);
                        } catch (err) {
                            console.error('Error parsing SMS data:', err);
                        }
                    } else {
                        console.error('SMS listener error:', error);
                    }
                },
                (error) => {
                    console.error('Failed to start SMS listener:', error);
                }
            );

            console.log('SMS listener started successfully');
        } catch (error) {
            console.error('Error starting SMS listener:', error);
        }
    };

    const stopSmsListener = () => {
        try {
            ReadSms.stopReadSMS();
            console.log('SMS listener stopped');
        } catch (error) {
            console.error('Error stopping SMS listener:', error);
        }
    };

    const handleIncomingSms = async (sender, body) => {
        // Filter by sender (bank SMS only)
        const senderUpper = sender.toUpperCase();
        const isBankSms = senderUpper.includes("AXISBK") ||
            senderUpper.includes("HDFC") ||
            senderUpper.includes("AXIS") ||
            senderUpper.includes("HDFCBK");

        if (!isBankSms) {
            console.log('Not a bank SMS, ignoring');
            return;
        }

        console.log('Bank SMS detected, processing...');

        // Get location immediately when SMS arrives
        let locationString = null;
        try {
            const loc = await getCurrentLocationWithArea();
            if (loc && (loc.area || loc.city)) {
                const parts = [];
                if (loc.area) parts.push(loc.area);
                if (loc.city) parts.push(loc.city);
                if (loc.postalCode) parts.push(loc.postalCode);
                locationString = parts.join(', ');
                console.log('Location captured:', locationString);
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }

        // Process the SMS
        const smsId = `live_${Date.now()}`;
        await processSms(body, sender, smsId, locationString);
    };

    const processSms = async (smsBody, sender, smsId, location) => {
        // Check if already processed
        if (processedSmsIds.has(smsId)) {
            console.log('SMS already processed, skipping');
            return;
        }

        // Mark as processed
        setProcessedSmsIds(prev => new Set([...prev, smsId]));

        // Parse the SMS
        const parsedData = parseAxisBankSms(smsBody);
        if (!parsedData) {
            console.log('Failed to parse SMS or not a transaction');
            return;
        }

        const { amount, type, last4Digits, date, merchantName, transactionMethod, description } = parsedData;

        console.log('Parsed transaction:', { amount, type, merchantName, date });

        // Check if this transaction already exists (avoid duplicates)
        const isDuplicate = [...transactions, ...pendingTransactions].some(t =>
            t.originalSms === smsBody ||
            (t.amount === amount && t.date === date && t.merchantName === merchantName)
        );

        if (isDuplicate) {
            console.log('Duplicate transaction, skipping');
            return;
        }

        // Find matching account by last 4 digits
        let accountId = null;
        if (last4Digits) {
            const matchedAccount = accounts.find(a => a.last4Digits === last4Digits);
            if (matchedAccount) {
                accountId = matchedAccount.id;
                console.log('Matched account:', matchedAccount.name);
            }
        }

        // Create pending transaction
        const newTransaction = {
            id: smsId,
            accountId,
            amount,
            type,
            category: 'Uncategorized',
            note: description,
            merchantName,
            transactionMethod,
            date,
            location: location || null,
            originalSms: smsBody,
            last4Digits
        };

        addPendingTransaction(newTransaction);
        console.log('Pending transaction created');

        // Send simple notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "💳 New Transaction Detected",
                body: `₹${amount} ${type === 'expense' ? 'spent' : 'received'}. Tap to categorize.`,
                data: { transactionId: newTransaction.id },
            },
            trigger: null, // Immediate
        });

        console.log('Notification sent');
    };

    return null;
};

export default SmsListener;
