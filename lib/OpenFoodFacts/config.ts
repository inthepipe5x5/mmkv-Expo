import { expo } from "@/app.json";
import { AxiosHeaders, AxiosHeaderValue } from "axios";
/**
 * @fileoverview This file contains the authentication methods for the OFF API.
 * API use @link https://openfoodfacts.github.io/openfoodfacts-server/api/#if-your-users-do-not-expect-a-result-immediately-eg-inventory-apps}
    * 
    * Auth Schemas {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#cmp--securityschemes-useragentauth}

*/
export type productCategoryType = "food" | "beauty" | "petfood";

export const createOpenFoodFactsURL = ({
    env = null,
    apiVersion = 2,
    countryCode = null,
    endpoint = "/",
    category = "food",
    getPrice = false,
}: {
    env?: string | null | undefined,
    apiVersion?: number | string | null | undefined,
    countryCode?: string | null | undefined,
    endpoint?: string | null | undefined,
    category?: productCategoryType
    getPrice?: boolean | null | undefined,
}) => {
    let tld = env ?? process.EN.EXPO_PUBLIC_NODE_ENV === "development" ? ".net" : "org";
    let domain = "openfoodfacts";
    let subdomain = countryCode ?? "world";
    let apiVersionString = `v${apiVersion ?? 2}`;
    let route = endpoint?.startsWith('/') && endpoint?.length > 1 ? endpoint.slice(1) : "/"

    //determine environment
    switch (true) {
        //ensure api version v1 and prices subdomain is used for prices
        case getPrice:
            subdomain = "prices";
            apiVersionString = `v1`;
            break;
        case category !== "food":
            domain = `open${category}facts`;
            break;
        default:
            tld = ".net";
    }
    const offURL = `https://${subdomain}${tld}/${domain}/${apiVersionString}/${route}`;
    console.log("OpenFoodFacts URL: ", offURL);
    return offURL;
};

/**
 * Creates headers for Open Food Facts (OFF) API requests.
 * 
 * @param {string} userId - The hashed public.profiles.user_id to be included in the header if provided.
 * 
 * @returns {HeadersInit} The headers for the OFF API request.
 * 
 * @remarks
 * - The `User-Agent` header is mandatory for all requests and must follow the format: `AppName/Version (ContactEmail)`.
 * - For global write operations, additional headers such as `Authorization` may be included if credentials are provided.
 * - Ensure that `app_name`, `app_version`, and `contact_email` are properly set in the environment or passed as parameters to avoid errors.
 * - This function is designed to support both read and write operations on the OFF API.
 */
export const CreateOFFHeader = (currentEnv: string | undefined = process.env.EXPO_PUBLIC_NODE_ENV): AxiosHeaderValue => {
    const contactEmail = process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? null

    if (!!!contactEmail) {
        throw new Error("Contact_email is required to generate OFF headers.");
    }
    //production headers
    if (currentEnv === "production") {
        const headers = new AxiosHeaders({
            'User-Agent': `${expo.name ?? "Home Scan App"}/${expo.version ?? `1.0.0`}(${contactEmail})`,
            'Content-Type': 'application/x-www-form-urlencoded',
        });

        console.log("OFF Headers: ", { headers });

        return headers
    }
    //development headers as default for staging environment
    //staging credentials = Staging require an http basic auth to avoid search engine indexing. The username is off, and the password off.
    const stagingHeaders = new AxiosHeaders({
        Authorization: 'Basic ' + ("off:off"),
        'User-Agent': `${expo.name ?? "Home Scan App"}/${expo.version ?? `1.0.0`}(${contactEmail})`,
        'Content-Type': 'application/x-www-form-urlencoded',
    });
    console.log("Staging OFF Headers: ", stagingHeaders);
    return stagingHeaders;
};

export interface OpenFoodFactsConfigObject {
    url: string;
    headers: AxiosHeaderValue;
    timeout: number;
    validateStatus: (status: number) => boolean;
}
type OpenFoodFactsConfigParams = {
    currentEnv: string | undefined;
    getPrice?: boolean;
    category?: productCategoryType;
    countryCode?: string | null;
    timeout?: number;
}
/* * @description This function creates the Open Food Facts configuration object to create an Axios instance.
 */
export const createOpenFoodFactsConfig = ({ currentEnv = process.ENV.EXPO_PUBLIC_NODE_ENV,
    getPrice = false,
    countryCode = null,
    category = "food",
    timeout = 5000, //5 seconds
}: OpenFoodFactsConfigParams) => {
    const env = currentEnv ?? "development";


    const config: OpenFoodFactsConfigObject = {
        url: createOpenFoodFactsURL({ env, getPrice, countryCode, category }),
        headers: CreateOFFHeader(env),
        timeout,
        validateStatus: (status: number): boolean => {
            return status >= 200 && status < 500; // Default
        }
    };
    console.log("OpenFoodFacts Config: ", JSON.stringify(config, null, 2));
    return config;
}



//use staging API for development purposes as per OFN recommendation

