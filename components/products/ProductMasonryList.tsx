import { MasonryFlashList } from '@shopify/flash-list';
import { Spinner } from "@/components/ui/spinner";
import supabase from "@/lib/supabase/supabase";
import { Database } from '@/lib/supabase/dbTypes';
import { useMemo } from "react";
import ProductCard from "@/components/products/ProductCard";
export type ProductMasonryListProps = {
    data: Database["public"]["Tables"]["products"]["Row"][];
    onPress: (item: Database["public"]["Tables"]["products"]["Row"]) => void;
};

export default function ProductMasonryList({ data, onPress }: ProductMasonryListProps) {

    return (
        <MasonryFlashList
            data={data}
            numColumns={2}
            renderItem={({ item }) => (
                <ProductCard product={item}
                    onPress={() => onPress(item)} />
            )}
            optimizeItemArrangement={true}
            estimatedItemSize={200}
        />
    );
}
