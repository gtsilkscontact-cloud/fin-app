import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { parseAxisBankSms } from '../utils/SmsParser';
import { getCurrentLocationWithArea } from '../utils/LocationHelper';
import * as Notifications from 'expo-notifications';

/**
 * SMS Test Simulator for Development
 * Simulates receiving bank SMS messages to test the transaction detection workflow
 */

// Sample SMS templates
const SAMPLE_SMS_TEMPLATES = [
    {
        name: 'UPI Payment',
        sender: 'AXISBK',
        body: `INR 150.00 debited
A/c no. XX9900
${new Date().toLocaleDateString('en-GB').split('/').reverse().join('-').slice(2)}, ${new Date().toLocaleTimeString('en-GB', { hour12: false })}
UPI/P2M/568615976445/SWIGGY FOOD
Not you? SMS BLOCKUPI Cust ID to 919951860002`
    },
    {
        name: 'Card Transaction',
        sender: 'AXISBK',
        body: `Axis Bank Spent INR 500
Axis Bank Card no. XX0358
${new Date().toLocaleDateString('en-GB').split('/').reverse().join('-').slice(2)} ${new Date().toLocaleTimeString('en-GB', { hour12: false })} IST
Amazon Pay
Avl Limit: INR 180740.19
Not you? SMS BLOCK 0358 to 919951860002`
    },
    {
        name: 'NEFT Credit',
        sender: 'AXISBK',
        body: `INR 5000.00 credited to A/c no. XX9900 on ${new Date().toLocaleDateString('en-GB').split('/').reverse().join('-').slice(2)} at ${new Date().toLocaleTimeString('en-GB', { hour12: false })} IST. Info - NEFT/CHASH00005243419/SALARY CREDIT. Chk Bal https://ccm.axbk.in/AXISBK/ltt3Dvko - Axis Bank`
    },
    {
        name: 'Restaurant Payment',
        sender: 'AXISBK',
        body: `Axis Bank Spent INR 850
Axis Bank Card no. XX0358
${new Date().toLocaleDateString('en-GB').split('/').reverse().join('-').slice(2)} ${new Date().toLocaleTimeString('en-GB', { hour12: false })} IST
Barbeque Nation
Avl Limit: INR 179890.19
Not you? SMS BLOCK 0358 to 919951860002`
    },
    {
        name: 'UPI to Friend',
        sender: 'AXISBK',
        body: `INR 200.00 debited
A/c no. XX9900
${new Date().toLocaleDateString('en-GB').split('/').reverse().join('-').slice(2)}, ${new Date().toLocaleTimeString('en-GB', { hour12: false })}
UPI/P2M/568615976445/RAJESH KUMAR
Not you? SMS BLOCKUPI Cust ID to 919951860002`
    }
];

const SmsTestSimulator = ({ onSimulateSms }) => {
    console.log('🧪 SmsTestSimulator component rendered');

    const simulateSms = async (template) => {
        console.log('🧪 Simulating SMS:', template.name);
        console.log('📱 Sender:', template.sender);
        console.log('📄 Body:', template.body);

        // Call the parent handler (which will be the SmsListener's handleIncomingSms)
        if (onSimulateSms) {
            await onSimulateSms(template.sender, template.body);
        }

        Alert.alert(
            '✅ SMS Simulated',
            `Simulated: ${template.name}\n\nCheck your Notifications tab to see the pending transaction!`,
            [{ text: 'OK' }]
        );
    };

    const showTemplateOptions = () => {
        const buttons = SAMPLE_SMS_TEMPLATES.map((template, index) => ({
            text: template.name,
            onPress: () => simulateSms(template)
        }));

        buttons.push({ text: 'Cancel', style: 'cancel' });

        Alert.alert(
            '📱 Select SMS Template',
            'Choose a sample transaction to simulate:',
            buttons
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.testButton}
                onPress={showTemplateOptions}
            >
                <Text style={styles.testButtonText}>🧪 Test SMS</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 0,
    },
    testButton: {
        backgroundColor: '#ff9800',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
    },
    testButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SmsTestSimulator;
