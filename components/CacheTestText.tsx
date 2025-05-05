import { ThemedText } from '@/components/ThemedText';
import { useStorageContext } from "@/components/contexts/StorageProvider";
export default function CacheTestText() {
    const { cache } = useStorageContext();

    return (
        <ThemedText>Random number in Cache: {!!cache.getItem("randomNumber") && !!cache.getItem(`randomNumberTimestamp`) ? `${cache.getItem("randomNumber")}  set at ${new Date(cache.getItem(`randomNumberTimestamp`) || '').toLocaleDateString()}` : "No number in storage"}</ThemedText>
    );
}