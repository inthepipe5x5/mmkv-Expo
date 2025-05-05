import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { removeOldestQuery } from '@tanstack/react-query-persist-client';
import * as appInfo from '@/app.json';
import { GeneralCache } from '@/lib/mmkv/index';

//#region persister 
// client for tanstack query to integrate with mmkv
export const mmkvGeneralPersister = createSyncStoragePersister({
    storage: new GeneralCache({}),
    key: `${appInfo.expo.slug}${process.env.EXPO_PUBLIC_KEY_SEPARATOR}queries`,
    retry: removeOldestQuery
    // retry: 1,
})