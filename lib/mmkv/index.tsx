import { MMKV, Configuration, Mode } from "react-native-mmkv";
import { Platform } from "react-native";

export const defaultCacheConfig = {
    id: "GeneralCache",
    encryptionKey: "GeneralCache",
    path: "/data/user/0/com.example.app/cache/mmkv",
    mode: Mode.MULTI_PROCESS,
} as Configuration

export const createStorage = (id: string = "fakeKey",
    config?: Omit<Partial<Configuration>, "id">
) => {
    const mobile = ['ios', 'android'].includes(Platform.OS);
    const storageConfig = config ?? defaultCacheConfig;
    //remove path if mobile //NOTE: this is not a good idea, but for now we will do it due to an open issue in react-native-mmkv
    if (mobile) {
        delete storageConfig.path;
    }
    const storage = new MMKV({
        id,
        ...(storageConfig),
    });
    console.log("MMKV storage created", { storageId: id }, JSON.stringify([{ storage }, { storageConfig }]), null, 2);
    //set a default value for hydratedAt
    storage.set("hydratedAt", new Date().toISOString());
    return storage;
}

export class GeneralCache {
    private storage: MMKV;
    hydratedAt: string | Date | null = null;
    constructor({ storage, config = defaultCacheConfig }: { storage?: MMKV, config?: Partial<Configuration> }) {
        const { id } = config ?? {};
        this.storage = storage ?? createStorage(id, config);
        this.hydratedAt = this.storage.getString("hydratedAt") ?? null;

        console.log("GeneralCache initialized", { storage: JSON.stringify(this.storage, null, 2) }, { config });
        console.log("HydratedAt", !!this.hydratedAt ? new Date(this.hydratedAt).toLocaleTimeString() : "Not hydrated yet");
    }

    getItem(key: string): string | null {
        return this.storage?.getString(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.storage?.set(key, value);
    }

    removeItem(key: string): void {
        this.storage?.delete(key);
    }

    clear(): void {
        this.storage?.clearAll();
    }
}