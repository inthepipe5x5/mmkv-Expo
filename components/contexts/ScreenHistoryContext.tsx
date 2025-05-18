import React, { createContext, useContext, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useSegments, useLocalSearchParams } from 'expo-router';
import { useAuth } from './SupabaseProvider';

type ScreenHistoryContextType = {
    history: {
        pathname: string;
        segments: string[];
        searchParams: Record<string, string>;
    }[];
    push: (entry: {
        pathname: string;
        segments: string[];
        searchParams: Record<string, string>;
    }) => void;
    clearHistory: () => void;
};

const ScreenHistoryContext = createContext<ScreenHistoryContextType | undefined>(undefined);

export const ScreenHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Create a ref to store the history
    // This will persist across renders
    const historyRef = useRef<ScreenHistoryContextType['history']>([]);
    const pathname = usePathname();
    const segments = useSegments();
    const searchParams = useLocalSearchParams();

    // Convert searchParams to a plain object
    const searchParamsObj = Object.fromEntries(
        Object.entries(searchParams).map(([k, v]) => [k, String(v)])
    );

    // Initialize history with the current pathname and searchParams
    const getHistory = useCallback(() => {
        const history = historyRef?.current ?? [];
        // Check if the history is empty
        if (history.length === 0) {
            history.push({
                pathname,
                segments,
                searchParams: searchParamsObj,
            });
        }
        historyRef.current = history;
        return historyRef.current;
    }, []);

    //#region effects
    // Push new screen to history when pathname changes
    useEffect(() => {
        const history = getHistory();
        const last = history[historyRef.current.length - 1];
        if (
            !last ||
            last.pathname !== pathname ||
            JSON.stringify(last.searchParams) !== JSON.stringify(searchParamsObj)
        ) {
            historyRef.current.push({
                pathname,
                segments,
                searchParams: searchParamsObj,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, JSON.stringify(searchParamsObj)]);

    const push = useCallback(
        (entry: { pathname: string; segments: string[]; searchParams: Record<string, string> }) => {
            const history = getHistory();
            history.push(entry);
        },
        []
    );

    const clearHistory = useCallback(() => {
        historyRef.current = [];
    }, []);

    const getLastEntry = useCallback(() => {
        const history = getHistory();
        const lastEntry = history[history.length - 1];
        if (lastEntry) {
            return lastEntry;
        }
        return {
            pathname: '',
            segments: [],
            searchParams: {},
        };
    }, []);

    const value = useMemo(
        () => ({
            history: historyRef.current,
            push,
            clearHistory,
        }), []);

    return (
        <ScreenHistoryContext.Provider
            value={value}
        >
            {children}
        </ScreenHistoryContext.Provider>
    );
};

export const useScreenHistory = () => {
    const context = useContext(ScreenHistoryContext);
    if (!context) {
        throw new Error('useScreenHistory must be used within a ScreenHistoryProvider');
    }
    return context;
};