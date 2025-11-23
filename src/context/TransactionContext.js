import React, { createContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@fin_app_data';

const initialState = {
    accounts: [],
    transactions: [],
};

const TransactionContext = createContext();

const reducer = (state, action) => {
    switch (action.type) {
        case 'LOAD_DATA':
            return action.payload;
        case 'ADD_ACCOUNT':
            return { ...state, accounts: [...state.accounts, action.payload] };
        case 'DELETE_ACCOUNT':
            return {
                ...state,
                accounts: state.accounts.filter(a => a.id !== action.payload),
                transactions: state.transactions.filter(t => t.accountId !== action.payload)
            };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [action.payload, ...state.transactions] };
        case 'ADD_TRANSACTIONS_BULK':
            return { ...state, transactions: [...action.payload, ...state.transactions] };
        default:
            return state;
    }
};

export const TransactionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (jsonValue != null) {
                    dispatch({ type: 'LOAD_DATA', payload: JSON.parse(jsonValue) });
                }
            } catch (e) {
                console.error("Failed to load data", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            const saveData = async () => {
                try {
                    const jsonValue = JSON.stringify(state);
                    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
                } catch (e) {
                    console.error("Failed to save data", e);
                }
            };
            saveData();
        }
    }, [state, isLoaded]);

    const addAccount = (account) => {
        dispatch({ type: 'ADD_ACCOUNT', payload: account });
    };

    const addTransaction = (transaction) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    };

    const addTransactionsBulk = (transactions) => {
        dispatch({ type: 'ADD_TRANSACTIONS_BULK', payload: transactions });
    };

    const deleteAccount = (accountId) => {
        dispatch({ type: 'DELETE_ACCOUNT', payload: accountId });
    };

    return (
        <TransactionContext.Provider
            value={{
                accounts: state.accounts,
                transactions: state.transactions,
                isLoaded,
                addAccount,
                deleteAccount,
                addTransaction,
                addTransactionsBulk,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionContext;
