import { createOpenFoodFactsConfig, createOpenFoodFactsURL, OpenFoodFactsConfigObject } from "@/lib/OpenFoodFacts/config";
import normalizeBarcode from "@/utils/barcode";
import axios, { AxiosHeaderValue, AxiosInstance } from "axios";
import { CustomOFFProductExtraInfoType, CustomOFFProductInfoType, OFFProducePricesResponseType } from "./types";

type OpenFoodFactsClientParams = {
    config: OpenFoodFactsConfigObject
}
const defaultConfig = createOpenFoodFactsConfig({ currentEnv: process.env.EXPO_PUBLIC_NODE_ENV });

export const CreateOpenFoodFactsClient = ({ config }: OpenFoodFactsClientParams) => {
    if (!!!config) {
        console.log("No config provided for OpenFoodFacts client, returning default client");
    }
    const { url, headers, timeout } = config || defaultConfig;
    const client: AxiosInstance = axios.create({
        baseURL: url,
        headers: { headers },
        timeout
    });
    return client;
}

export const OpenFoodFactsClient = () => {
    const client = CreateOpenFoodFactsClient({ config: defaultConfig });
    return client;
}

export const OpenPricesClient = () => {
    const config = createOpenFoodFactsConfig({ currentEnv: process.env.EXPO_PUBLIC_NODE_ENV, getPrice: true });
    const client = CreateOpenFoodFactsClient({ config });
    return client;
}

// get product prices
async function getProductPricesByBarcode(barcode: string): Promise<any> {
    try {
        const client = OpenPricesClient();
        // await this.addUserHeaders();
        const normalizedBarcode = normalizeBarcode(barcode);
        const pricesURL = createOpenFoodFactsURL({
            apiVersion: 1,
            getPrice: true,
            endpoint: `/product/${normalizedBarcode}`
        });
        const response = await client.get(pricesURL, {
            params: { code: normalizedBarcode },
        });

        if (response.status !== 200) {
            throw new Error(`Error fetching product prices: ${response.statusText}`);
        }

        return response.data;
    } catch (error) {
        console.error("Error fetching product prices:", error);
        return null;
    }
}
async function getCombinedProductData(barcode: string): Promise<any> {
    try {
        const client = OpenFoodFactsClient();
        const normalizedBarcode = normalizeBarcode(barcode);
        const [baseProduct, extraInfoData, priceData] = await Promise.all([
            client.get(`/product/${normalizedBarcode}.json`),
            client.get(`/product/${normalizedBarcode}`, {
                params: { product_type: "all", fields: "knowledge_panels" },
            }),
            getProductPricesByBarcode(barcode)
        ])
        //handle errors
        if ([
            baseProduct?.status !== 200,
            extraInfoData?.status !== 200,
            priceData?.status !== 200,
            Object.values(baseProduct?.data).find(value => typeof value === 'string' && ["product not found", "product_not_found"].includes(value)),
            extraInfoData,
            priceData?.data?.detail === 'No Product matches the given query'].
            some(Boolean)) {
            throw new Error(`Error fetching combined product data: ${{ baseProduct, extraInfoData, priceData }}`);
        }

        const helper = new OFFProductHelper();
        const productInfo = helper.getOFFProductInfo(baseProduct.data);
        const extraInfo = helper.getExtraOFFProductInfo(extraInfoData.data);
        const parsedPrices = helper.getOFFPricesInfo(priceData.data);

        return {
            raw: {
                baseProduct: baseProduct.data,
                extraInfoData: extraInfoData.data,
                priceData: priceData.data,
            },
            productInfo,
            extraInfo,
            prices: parsedPrices,
        };
    } catch (error) {
        console.error("Error fetching combined product data:", error);
        return null;
    }
}

export class OFFProductHelper {

    findIngredientsByStatus = (
        ingredients: Array<Record<string, any>>,
        diet: string,
        status: string | null | undefined
    ): Record<string, any> | undefined =>
        !!status ? ingredients.find(ingredient => ingredient[diet] === status) : undefined;

    formatIngredientName = (name: string): string => {
        const noLowerDashName = name.replace(/_/g, '');
        return noLowerDashName.charAt(0).toUpperCase() + noLowerDashName.slice(1);
    };

    getIngredientsStatus = (
        ingredients: Array<Record<string, any>>
    ): Array<{ name: string; vegan: string; vegetarian: string }> =>
        ingredients.map(ingredient => {
            const newIngredient = {
                name: this.formatIngredientName(ingredient.text),
                vegan: 'unknown',
                vegetarian: 'unknown',
            };
            // vegan
            if (ingredient.vegan) {
                newIngredient.vegan = ingredient.vegan;
            }

            // vegetarian
            if (ingredient.vegetarian) {
                newIngredient.vegetarian = ingredient.vegetarian;
            }

            return newIngredient;
        });

    checkDietStatus = (
        ingredients: Array<Record<string, any>>,
        diet: string
    ): string => {
        switch (true) {
            case !!this.findIngredientsByStatus(ingredients, diet, 'no'):
                return 'no';
            // case !!this.findIngredientsByStatus(ingredients, diet, undefined):
            //     return 'unknown';
            case !!this.findIngredientsByStatus(ingredients, diet, 'unknown'):
                return 'unknown';
            case !!this.findIngredientsByStatus(ingredients, diet, 'maybe'):
                return 'maybe';
            case !!this.findIngredientsByStatus(ingredients, diet, 'yes'):
                return 'yes';
            default:
                return 'unknown';
        }
    };

    getNonDietIngredients = (
        ingredients: Array<Record<string, any>>,
        diet: string
    ): Array<Record<string, any>> => {
        return ingredients.filter(ingredient => {
            if (!ingredient[diet]) {
                return true;
            } else if (ingredient[diet] !== 'yes') {
                return true;
            } else {
                return false;
            }
        });
    };

    sortNonDietaryIngredients = (
        ingredients: Array<Record<string, any>>,
        diet: string
    ): Array<Record<string, any>> => {
        const sortOrder = ['no', 'maybe', 'unknown'];
        const initialIngredients = [...ingredients];
        return initialIngredients.sort(
            (a, b) => sortOrder.indexOf(a[diet]) - sortOrder.indexOf(b[diet])
        );
    };


    getExtraOFFProductInfo(data: any): CustomOFFProductExtraInfoType {
        const knowledgePanels = data?.product?.knowledge_panels;

        const extraInformation: CustomOFFProductExtraInfoType = {
            health: {
                additives: [],
                nutrients: [],
                warnings: [],
            },
            other: {
                isRecyclable: undefined,
                isPalmOilFree: 'unknown', // Initialize
                isVegan: 'unknown',
                isVegetarian: 'unknown',
            },
        };

        if (knowledgePanels) {
            // Extract Additives
            for (const key in knowledgePanels) {
                if (key.startsWith("additive_en:")) {
                    const additive = knowledgePanels[key];
                    const additiveInfo = {
                        name: additive?.title_element?.title || "",
                        information: additive?.elements?.[0]?.text_element?.html,
                        sourceText: additive?.elements?.[0]?.text_element?.source_text,
                        sourceUrl: additive?.elements?.[0]?.text_element?.source_url,
                    };
                    extraInformation.health.additives.push(additiveInfo);
                }
            }

            // Extract Nutrient Levels with IDs
            const nutrientLevels: { key: string; id: string }[] = [
                { key: "nutrient_level_fat", id: "fat" },
                { key: "nutrient_level_saturated-fat", id: "saturatedFat" },
                { key: "nutrient_level_sugars", id: "sugars" },
                { key: "nutrient_level_salt", id: "salt" },
            ];

            nutrientLevels.forEach(({ key, id }) => {
                const level = knowledgePanels[key];
                if (level) {
                    const title = level?.title_element?.title || "";
                    const match = title.match(/([\d.]+)\s*([a-zA-Z%]+)/);
                    const quantity = match ? match[1] : "";
                    const unit = match ? match[2] : "";

                    extraInformation.health.nutrients.push({
                        id: id, // Use the defined ID
                        name: level?.title_element?.name || "",
                        quantity: quantity,
                        unit: unit,
                        evaluation: level?.evaluation,
                        information: level?.elements?.[0]?.text_element?.html,
                    });
                }
            });

            // Extract Ultra-Processed Food Warnings
            const ultraProcessed = knowledgePanels?.recommendation_ultra_processed_foods;
            if (ultraProcessed) {
                extraInformation.health.warnings.push({
                    text: ultraProcessed.title_element?.title + " " + ultraProcessed.title_element?.subtitle || "",
                    level: ultraProcessed.level,
                    evaluation: ultraProcessed.evaluation,
                });

            }

            // Extract Other Information (Recyclable, Palm Oil, Vegan, Vegetarian)
            extraInformation.other.isRecyclable = knowledgePanels["packaging_recycling"]?.evaluation === 'good'

            const palmOilStatus = knowledgePanels["ingredients_analysis_en:palm-oil-free"]?.evaluation;
            extraInformation.other.isPalmOilFree = palmOilStatus === "good" ? "yes" : palmOilStatus === "bad" ? 'no' : "unknown";


            const veganStatus = knowledgePanels["ingredients_analysis_en:vegan-status-unknown"]?.evaluation;
            extraInformation.other.isVegan = veganStatus === "good" ? "yes" : veganStatus === "bad" ? "no" : "unknown";

            const vegetarianStatus = knowledgePanels["ingredients_analysis_en:vegetarian-status-unknown"]?.evaluation;
            extraInformation.other.isVegetarian = vegetarianStatus === "good" ? "yes" : vegetarianStatus === "bad" ? "no" : "unknown";

        }

        return extraInformation;
    }


    getOFFProductInfo(data: any): CustomOFFProductInfoType {
        const product = data.product;

        const packaging: string[] = product.packaging_tags
            ? product.packaging_tags.map((tag: string) => tag.replace('en:', ''))
            : [];

        const ingredients = product.ingredients
            ? product.ingredients.map((ing: any) => ({
                text: ing.text,
                id: ing.id,
                vegan: ing.vegan,
                vegetarian: ing.vegetarian,
            })).filter((ingredient: any) => ingredient.id.startsWith('en:'))
            : [];

        return {
            code: product.code,
            codes_tags: product.codes_tags ? product.codes_tags.map((tag: string) => tag.replace('en:', '')) : [],
            productName: product.product_name_en || product.product_name || "",
            genericName: product.generic_name_en || product.generic_name || "",
            brand: product.brands || product.brands_tags[0] || "",
            category: product.category_properties["ciqual_food_name:en"] || product.compared_to_category.replace('en:', "").replaceAll("-", " ") || "",
            image: product.image_front_url || "",
            nutriscore: product.nutriscore_grade || "not-applicable",
            novaGroup: product.nova_group || -1,
            ecoscore: product.ecoscore_grade || "not-applicable",
            ingredients: ingredients,
            additives: product.additives_tags ? product.additives_tags.map((tag: string) => tag.replace('en:', '')) : [],
            allergens: product.allergens_tags ? product.allergens_tags.map((tag: string) => tag.replace('en:', '')) : [],
            nutriments: {
                energy: product.nutriments.energy_100g,
                energyKj: product.nutriments["energy-kj_100g"],
                energyKcal: product.nutriments["energy-kcal_100g"],
                proteins: product.nutriments.proteins_100g,
                casein: product.nutriments.casein_100g,
                serumProteins: product.nutriments["serum-proteins_100g"],
                nucleotides: product.nutriments.nucleotides_100g,
                carbohydrates: product.nutriments["carbohydrates_100g"],
                sugars: product.nutriments.sugars_100g,
                sucrose: product.nutriments.sucrose_100g,
                glucose: product.nutriments.glucose_100g,
                fructose: product.nutriments.fructose_100g,
                lactose: product.nutriments.lactose_100g,
                maltose: product.nutriments.maltose_100g,
                maltodextrins: product.nutriments.maltodextrins_100g,
                starch: product.nutriments.starch_100g,
                polyols: product.nutriments.polyols_100g,
                fat: product.nutriments.fat_100g,
                saturatedFat: product.nutriments["saturated-fat_100g"],
                butyricAcid: product.nutriments["butyric-acid_100g"],
                caproicAcid: product.nutriments["caproic-acid_100g"],
                caprylicAcid: product.nutriments["caprylic-acid_100g"],
                capricAcid: product.nutriments["capric-acid_100g"],
                lauricAcid: product.nutriments["lauric-acid_100g"],
                myristicAcid: product.nutriments["myristic-acid_100g"],
                palmiticAcid: product.nutriments["palmitic-acid_100g"],
                stearicAcid: product.nutriments["stearic-acid_100g"],
                arachidicAcid: product.nutriments["arachidic-acid_100g"],
                behenicAcid: product.nutriments["behenic-acid_100g"],
                lignocericAcid: product.nutriments["lignoceric-acid_100g"],
                ceroticAcid: product.nutriments["cerotic-acid_100g"],
                montanicAcid: product.nutriments["montanic-acid_100g"],
                melissicAcid: product.nutriments["melissic-acid_100g"],
                monounsaturatedFat: product.nutriments["monounsaturated-fat_100g"],
                polyunsaturatedFat: product.nutriments["polyunsaturated-fat_100g"],
                omega3Fat: product.nutriments["omega-3-fat_100g"],
                alphaLinolenicAcid: product.nutriments["alpha-linolenic-acid_100g"],
                eicosapentaenoicAcid: product.nutriments["eicosapentaenoic-acid_100g"],
                docosahexaenoicAcid: product.nutriments["docosahexaenoic-acid_100g"],
                omega6Fat: product.nutriments["omega-6-fat_100g"],
                linoleicAcid: product.nutriments["linoleic-acid_100g"],
                arachidonicAcid: product.nutriments["arachidonic-acid_100g"],
                gammaLinolenicAcid: product.nutriments["gamma-linolenic-acid_100g"],
                dihomGammaLinolenicAcid: product.nutriments["dihomo-gamma-linolenic-acid_100g"],
                omega9Fat: product.nutriments["omega-9-fat_100g"],
                oleicAcid: product.nutriments["oleic-acid_100g"],
                elaidicAcid: product.nutriments["elaidic-acid_100g"],
                gondoicAcid: product.nutriments["gondoic-acid_100g"],
                meadAcid: product.nutriments["mead-acid_100g"],
                erucicAcid: product.nutriments["erucic-acid_100g"],
                nervonicAcid: product.nutriments["nervonic-acid_100g"],
                transFat: product.nutriments["trans-fat_100g"],
                cholesterol: product.nutriments.cholesterol_100g,
                fiber: product.nutriments["fiber_100g"],
                sodium: product.nutriments["sodium_100g"],
                alcohol: product.nutriments["alcohol_100g"],
                vitaminA: product.nutriments["vitamin-a_100g"],
                vitaminD: product.nutriments["vitamin-d_100g"],
                vitaminE: product.nutriments["vitamin-e_100g"],
                vitaminK: product.nutriments["vitamin-k_100g"],
                vitaminC: product.nutriments["vitamin-c_100g"],
                vitaminB1: product.nutriments["vitamin-b1_100g"],
                vitaminB2: product.nutriments["vitamin-b2_100g"],
                vitaminPP: product.nutriments["vitamin-pp_100g"],
                vitaminB6: product.nutriments["vitamin-b6_100g"],
                vitaminB9: product.nutriments["vitamin-b9_100g"],
                vitaminB12: product.nutriments["vitamin-b12_100g"],
                biotin: product.nutriments["biotin_100g"],
                pantothenicAcid: product.nutriments["pantothenic-acid_100g"],
                silica: product.nutriments["silica_100g"],
                bicarbonate: product.nutriments["bicarbonate_100g"],
                potassium: product.nutriments["potassium_100g"],
                chloride: product.nutriments["chloride_100g"],
                calcium: product.nutriments["calcium_100g"],
                phosphorus: product.nutriments["phosphorus_100g"],
                iron: product.nutriments["iron_100g"],
                magnesium: product.nutriments["magnesium_100g"],
                zinc: product.nutriments["zinc_100g"],
                copper: product.nutriments["copper_100g"],
                manganese: product.nutriments["manganese_100g"],
                fluoride: product.nutriments["fluoride_100g"],
                selenium: product.nutriments["selenium_100g"],
                chromium: product.nutriments["chromium_100g"],
                molybdenum: product.nutriments["molybdenum_100g"],
                iodine: product.nutriments["iodine_100g"],
                caffeine: product.nutriments["caffeine_100g"],
                taurine: product.nutriments["taurine_100g"],
                ph: product.nutriments["ph_100g"]
            },
            servingSize: product.serving_size || "",
            quantity: product.quantity || "",
            packaging: packaging,
            manufacturingPlaces: product.manufacturing_places_tags ? product.manufacturing_places_tags.map((place: string) => place.replace('en:', '')) : [],
            categories: product.categories_tags ? product.categories_tags.map((category: string) => category.replace('en:', '')) : [],
            compared_to_category: product.compared_to_category || "",
            compared_to_category_tags: product.compared_to_category_tags ? product.compared_to_category_tags.map((tag: string) => tag.replace('en:', '')) : []
        };
    }

    getOFFPricesInfo(pricesData: OFFProducePricesResponseType) {
        const prices = {
            pricesId: pricesData.id,
            productName: pricesData.product_name,
            categoryTags: pricesData.categories_tags,
            productImage: pricesData.image_url,
            productCode: pricesData.code,
            brand: pricesData.brands,
            brandTags: pricesData.brands_tags,
            labels: pricesData.labels_tags,
            product_quantity: pricesData.product_quantity,
            quantity_unit: pricesData.product_quantity_unit,
        };
        return prices;
    }
}