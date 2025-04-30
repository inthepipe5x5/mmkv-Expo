import { ThemedText } from '@/components/ThemedText';
import { useRootContext } from '@/app/_layout';
export default function CacheTestText() {
    const { cache } = useRootContext();
    
    return (
        <ThemedText>Random number in Cache: {!!cache.getItem("randomNumber") && !!cache.getItem(`randomNumberTimestamp`) ? `${cache.getItem("randomNumber")}  set at ${new Date(cache.getItem(`randomNumberTimestamp`) || '').toLocaleDateString()}` : "No number in storage"}</ThemedText>
    );
}