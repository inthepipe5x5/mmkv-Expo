import { MMKV, Configuration, Mode } from "react-native-mmkv";

export const createStorage = (id: string = "fakeKey",
    config?: Partial<Configuration>
) => {
    const storage = new MMKV({
        id,
        ...(config ?? {}),
    });
    console.log("MMKV storage created", { storageId: id }, { storage });
    return storage;
}

export class GeneralCache {
    private storage: MMKV;

    constructor({ storage, config = {
        id: "GeneralCache",
        encryptionKey: "GeneralCache",
        // path: "/data/user/0/com.example.app/cache/mmkv",
        mode: Mode.MULTI_PROCESS
    } }: { storage?: MMKV, config?: Partial<Configuration> }) {
        const { id } = config ?? {};
        this.storage = storage ?? createStorage(id, config);
        console.log("GeneralCache initialized", { storage: this.storage });
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