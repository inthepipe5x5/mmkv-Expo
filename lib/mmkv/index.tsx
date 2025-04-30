import { MMKV, Configuration } from "react-native-mmkv";

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