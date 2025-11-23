import React, { createContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@fin_app_data';

const initialState = {
    accounts: [],
    transactions: [],
    pendingTransactions: [],
    cardGroups: [],
    customCategories: [],
    budgets: [],
};

const TransactionContext = createContext();

const reducer = (state, action) => {
    switch (action.type) {
        case 'LOAD_DATA':
            return {
                ...initialState,
                ...action.payload,
                customCategories: action.payload.customCategories || [],
                budgets: action.payload.budgets || [],
                pendingTransactions: action.payload.pendingTransactions || [],
                cardGroups: action.payload.cardGroups || []
            };
        case 'ADD_ACCOUNT':
            return { ...state, accounts: [...(state.accounts || []), action.payload] };
        case 'UPDATE_ACCOUNT':
            return {
                ...state,
                accounts: (state.accounts || []).map(a =>
                    a.id === action.payload.id ? action.payload : a
                )
            };
        case 'DELETE_ACCOUNT':
            return {
                ...state,
                accounts: (state.accounts || []).filter(a => a.id !== action.payload),
                transactions: (state.transactions || []).filter(t => t.accountId !== action.payload)
            };
        case 'ADD_CARD_GROUP':
            return { ...state, cardGroups: [...(state.cardGroups || []), action.payload] };
        case 'UPDATE_CARD_GROUP':
            return {
                ...state,
                cardGroups: (state.cardGroups || []).map(g =>
                    g.id === action.payload.id ? action.payload : g
                )
            };
        case 'DELETE_CARD_GROUP':
            return {
                ...state,
                cardGroups: (state.cardGroups || []).filter(g => g.id !== action.payload),
                accounts: (state.accounts || []).map(a =>
                    a.cardGroup === action.payload ? { ...a, cardGroup: null } : a
                )
            };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [action.payload, ...(state.transactions || [])] };
        case 'UPDATE_TRANSACTION':
            return {
                ...state,
                transactions: (state.transactions || []).map(t =>
                    t.id === action.payload.id ? action.payload : t
                )
            };
        case 'ADD_TRANSACTIONS_BULK':
            return { ...state, transactions: [...action.payload, ...(state.transactions || [])] };
        case 'DELETE_TRANSACTION':
            return {
                ...state,
                transactions: (state.transactions || []).filter(t => t.id !== action.payload)
            };
        case 'ADD_PENDING_TRANSACTION':
            return { ...state, pendingTransactions: [action.payload, ...(state.pendingTransactions || [])] };
        case 'CONFIRM_TRANSACTION':
            return {
                ...state,
                pendingTransactions: (state.pendingTransactions || []).filter(t => t.id !== action.payload)
            };
        case 'DELETE_PENDING_TRANSACTION':
            return {
                ...state,
                pendingTransactions: (state.pendingTransactions || []).filter(t => t.id !== action.payload)
            };
        case 'ADD_CUSTOM_CATEGORY':
            return { ...state, customCategories: [...(state.customCategories || []), action.payload] };
        case 'UPDATE_CUSTOM_CATEGORY':
            return {
                ...state,
                customCategories: (state.customCategories || []).map(c =>
                    c.id === action.payload.id ? action.payload : c
                )
            };
        case 'DELETE_CUSTOM_CATEGORY':
            return {
                ...state,
                customCategories: (state.customCategories || []).filter(c => c.id !== action.payload)
            };
        case 'ADD_BUDGET':
            return { ...state, budgets: [...(state.budgets || []), action.payload] };
        case 'UPDATE_BUDGET':
            return {
                ...state,
                budgets: (state.budgets || []).map(b =>
                    b.id === action.payload.id ? action.payload : b
                )
            };
        case 'DELETE_BUDGET':
            return {
                ...state,
                budgets: (state.budgets || []).filter(b => b.id !== action.payload)
            };
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

    const updateAccount = (account) => {
        dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
    };

    const addTransaction = (transaction) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    };

    const updateTransaction = (transaction) => {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
    };

    const addTransactionsBulk = (transactions) => {
        dispatch({ type: 'ADD_TRANSACTIONS_BULK', payload: transactions });
    };

    const deleteTransaction = (transactionId) => {
        dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
    };

    const addPendingTransaction = (transaction) => {
        dispatch({ type: 'ADD_PENDING_TRANSACTION', payload: transaction });
    };

    const confirmTransaction = (transactionId) => {
        dispatch({ type: 'CONFIRM_TRANSACTION', payload: transactionId });
    };

    const deletePendingTransaction = (transactionId) => {
        dispatch({ type: 'DELETE_PENDING_TRANSACTION', payload: transactionId });
    };

    const deleteAccount = (accountId) => {
        dispatch({ type: 'DELETE_ACCOUNT', payload: accountId });
    };

    const addCardGroup = (cardGroup) => {
        dispatch({ type: 'ADD_CARD_GROUP', payload: cardGroup });
    };

    const updateCardGroup = (cardGroup) => {
        dispatch({ type: 'UPDATE_CARD_GROUP', payload: cardGroup });
    };

    const deleteCardGroup = (groupId) => {
        dispatch({ type: 'DELETE_CARD_GROUP', payload: groupId });
    };

    const addCustomCategory = (category) => {
        dispatch({ type: 'ADD_CUSTOM_CATEGORY', payload: category });
    };

    const updateCustomCategory = (category) => {
        dispatch({ type: 'UPDATE_CUSTOM_CATEGORY', payload: category });
    };

    const deleteCustomCategory = (categoryId) => {
        dispatch({ type: 'DELETE_CUSTOM_CATEGORY', payload: categoryId });
    };

    const addBudget = (budget) => {
        dispatch({ type: 'ADD_BUDGET', payload: budget });
    };

    const updateBudget = (budget) => {
        dispatch({ type: 'UPDATE_BUDGET', payload: budget });
    };

    const deleteBudget = (budgetId) => {
        dispatch({ type: 'DELETE_BUDGET', payload: budgetId });
    };

    return (
        <TransactionContext.Provider
            value={{
                accounts: state.accounts,
                transactions: state.transactions,
                pendingTransactions: state.pendingTransactions || [],
                cardGroups: state.cardGroups || [],
                customCategories: state.customCategories || [],
                budgets: state.budgets || [],
                isLoaded,
                addAccount,
                updateAccount,
                deleteAccount,
                addCardGroup,
                updateCardGroup,
                deleteCardGroup,
                addTransaction,
                updateTransaction,
                addTransactionsBulk,
                deleteTransaction,
                addPendingTransaction,
                confirmTransaction,
                deletePendingTransaction,
                addCustomCategory,
                updateCustomCategory,
                deleteCustomCategory,
                addBudget,
                updateBudget,
                deleteBudget,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionContext;
