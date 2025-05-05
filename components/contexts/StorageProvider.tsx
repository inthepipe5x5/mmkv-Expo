
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GeneralCache } from '@/lib/mmkv/index';
//#region create context
export const StorageContext = createContext<{
    initialized: boolean;
    setInitialized: (value: boolean) => void;
    cache: GeneralCache;
} | null>(null);
// #endregion create context
// #region provider
export const StorageContextProvider = ({ children }: { children: React.ReactNode }) => {
    const cache = useMemo(() => new GeneralCache({}), []);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        //set initialized to true
        setInitialized(true);
        cache.setItem('cacheInitialized', new Date().toUTCString());
        console.log('StorageContextProvider initialized:', { initialized });
    }, []);

    const value = useMemo(() => ({
        initialized,
        setInitialized,
        cache,
    }), [initialized, cache]);

    return (
        <StorageContext.Provider value={value}>
            {children}
        </StorageContext.Provider >
    );
}
// #endregion provider
// #region hook
export const useStorageContext = () => {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useStorageContext must be used within a StorageContextProvider');
    }
    return context;
}
// #endregion hook