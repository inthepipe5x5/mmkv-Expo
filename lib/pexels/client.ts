import axios, { AxiosInstance } from "axios";
import { PEXELS_API_KEY, PEXELS_API_URL } from "@/lib/pexels/config";
import { PexelsResponse, PexelsResponseImageObject, PexelsResponseImageSrcKey } from "./types";
if (!!!PEXELS_API_KEY) {
    throw new Error("PEXELS_API_KEY is not defined. Please set it in your environment variables.");
}

export const createPexelsClient = () => axios.create({
    baseURL: PEXELS_API_URL,
    headers: {
        Authorization: PEXELS_API_KEY,
        "Content-Type": "application/json",
    },
    timeout: 10000,
    validateStatus: (status) => {
        return status >= 200 && status < 500; // Default
    },
})

export type PexelsClientType = {
    client: AxiosInstance;
    currentQuery: {
        endpoint?: string;
        page: number;
        per_page: number;
        query: string;
        params: Record<string, any>;
        total_results?: number | null | undefined;
        next_page: string | null;
        prev_page?: string | null;
    };
    updateCurrentQuery: (updatedQuery: Partial<{
        endpoint?: string;
        page: number;
        per_page: number;
        query: string;
        params: Record<string, any>;
        total_results?: number | null | undefined;
        next_page: string | null;
        prev_page?: string | null;
    }>) => void
    searchPhotos: (query?: string, color?: string, page?: number, per_page?: number) => Promise<any>;
    nextPage: () => Promise<any>;
    prevPage: () => Promise<any>;
    getPhoto: (id: string) => Promise<any>;
    getCuratedPhotos: (page?: number, per_page?: number) => Promise<any>;
    getVideos: (query: string, page?: number, per_page?: number) => Promise<any>;
}

export default class PexelsClient implements PexelsClientType {
    client: AxiosInstance = createPexelsClient();
    currentQuery: {
        endpoint?: string;
        page: number;
        per_page: number;
        query: string;
        params: Record<string, any>;
        total_results?: number | null | undefined;
        next_page: string | null;
        prev_page?: string | null;
    } = {
            endpoint: "curated",
            page: 1,
            per_page: 15,
            query: "",
            params: {},
            total_results: 0,
            prev_page: null,
            next_page: null,
        }

    updateCurrentQuery = (updatedQuery: Partial<{
        endpoint?: string;
        page: number;
        per_page: number;
        query?: string;
        params: Record<string, any>;
        total_results?: number | null | undefined;
        next_page: string | null;
        prev_page?: string | null;
    }>) => {
        //check if new query
        const existingQuery = [
            !!this.currentQuery.query,
            !!this.currentQuery.page,
            this.currentQuery.endpoint === updatedQuery.endpoint,
            updatedQuery.query === this.currentQuery.query,
            updatedQuery.page === this.currentQuery.page + 1,
        ].every(Boolean)
        // Merge the current query with the updated query
        this.currentQuery = existingQuery ? {
            ...this.currentQuery,
            ...updatedQuery,
        } : updatedQuery as any;
        console.log("Updated current query:", JSON.stringify(this.currentQuery, null, 4));
    };
    /** Fetches photos from Pexels API based on a search query.
     * 
     * @param query - The search query string.
     * @param page - The page number to fetch (default is 1).
     * @param per_page - The number of photos per page (default is 15).
     * @returns {Promise<PexelsResponse>} The response data containing the photos.
     */
    async searchPhotos(query: string = "avatar", color?: string, page: number = 1, per_page: number = 15) {
        try {
            const { query: currentQuery, page: currentPage, per_page: currentPerPage } = this.currentQuery;
            let params = {
                page: currentPage,
                per_page: currentPerPage,
            } as Record<string, any>;

            switch (true) {
                case !!color:
                    params = {
                        ...params,
                        color: color,
                    };
                // break; // No break here to allow for query to be added as well
                case !!query:
                    params = {
                        ...params,
                        query: query,
                    };
                    break;
                case !!currentQuery:
                    params = {
                        ...params,
                        query: currentQuery,
                    };
                    break;
            }

            const response = await this.client.get("search", {
                params
            });
            this.updateCurrentQuery({
                endpoint: "search", query, page: page + 1,
                per_page: response?.data?.per_page ?? per_page,
                total_results: response.data.total_results,
                next_page: response.data.next_page ?? null,
                prev_page: response.data.prev_page ?? null
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching photos:", error);
            throw error;
        }
    }

    async nextPage() {
        try {
            const { page, per_page, query, next_page } = this.currentQuery;
            const endpoint = this.currentQuery.endpoint ?? "search";
            // Check if there is a next page url available or if we need to fetch the next page using the current query
            const response = !!next_page ?
                await this.client.get(next_page)
                : await this.client.get("search", {
                    params: {
                        query,
                        page: page + 1,
                        per_page,
                    },
                });
            this.updateCurrentQuery({
                endpoint: endpoint,
                query, page: page + 1,
                per_page: response?.data?.per_page ?? per_page,
                total_results: response.data.total_results,
                next_page: response.data.next_page ?? null,
                prev_page: response.data.prev_page ?? null
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching next page:", error);
            throw error;
        }
    }
    async prevPage() {
        try {
            const { page, per_page, query, next_page } = this.currentQuery;
            const endpoint = this.currentQuery.endpoint ?? "search";

            // Check if there is a next page url available or if we need to fetch the next page using the current query
            const response = !!next_page ?
                await this.client.get(next_page)
                : await this.client.get("search", {
                    params: {
                        query,
                        page: page + 1,
                        per_page,
                    },
                });
            this.updateCurrentQuery({
                endpoint,
                page: page > 2 ? page - 1 : 1,
                total_results: response.data.total_results,
                next_page: response.data.next_page ?? null,
                prev_page: response.data.prev_page ?? null
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching next page:", error);
            throw error;
        }
    }
    /** Fetches a single photo by ID from Pexels API.
     *  
     * * @param id - The ID of the photo to fetch.
     * * @returns The photo data.
     * * @throws Error if the request fails.
     * * @remarks This endpoint fetches a single photo by its ID. The ID is a unique identifier for each photo in the Pexels database.
     * * @example
     * const photo = await pexelsClient.getPhoto("1234567890");
     * console.log(photo);
     * * @see {@link https://www.pexels.com/api/documentation/#get-a-photo} for more details.
     * */

    async getPhoto(id: string) {
        try {
            const response = await this.client.get(`photos/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching photo:", error);
            throw error;
        }
    }

    /** Fetches curated photos from Pexels API.
     * 
     * @param page 
     * @param per_page 
     * @returns 
     * 
     * @remarks  This endpoint fetches receive real-time photos curated by the Pexels team.
They add at least one new photo per hour to our curated list so that you always get a changing selection of trending photos. 
     */
    async getCuratedPhotos(page: number = 1, per_page: number = 15) {
        try {
            const response = await this.client.get("curated", {
                params: {
                    page,
                    per_page,
                },
            });
            this.updateCurrentQuery({
                endpoint: "curated",
                page: page + 1,
                per_page: response?.data?.per_page ?? per_page,
                total_results: response.data.total_results,
                next_page: response.data.next_page ?? null,
                prev_page: response.data.prev_page ?? null
            });
            console.log("Curated photos:", JSON.stringify(response.data, null, 4));
            return response.data;

        } catch (error) {
            console.error("Error fetching curated photos:", error);
            throw error;
        }
    }

    /** Fetches videos from Pexels API.
     * 
     */
    async getVideos(query: string, page: number = 1, per_page: number = 15) {
        try {
            this.updateCurrentQuery({ query, page, per_page });
            const { query: currentQuery, page: currentPage, per_page: currentPerPage } = this.currentQuery;
            const queryURL = PEXELS_API_URL.replace('v1', "videos/search")
            const response = await this.client.get(queryURL, {
                params: {
                    query: currentQuery,
                    page: currentPage,
                    per_page: currentPerPage,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching videos:", error);
            throw error;
        }
    }

    getSafeCuratedPhotos(
        data: PexelsResponse,
        srcKey: PexelsResponseImageSrcKey = "original",
        asArray: boolean = false,
    ): string | string[] | null {
        if (!!!data || !!!data?.photos) return null;

        const { photos } = data;
        //return the first photo if the srcKey is in the src object and asArray is false
        if (srcKey in photos?.[0]?.src && !asArray) {
            return photos?.[0].src[srcKey] ?? null;
        }

        let output = photos.map((photo: PexelsResponseImageObject, index: number) => {
            if (!!!photo?.src) {
                console.warn("Photo does not have a src property:", photo);
                return null;
            }
            const src = photo.src as Record<string, string>;
            switch (true) {
                case srcKey in src:
                    return src[srcKey];
                case "original" in src:
                    return src.original;
                case "large2x" in src:
                    return src.large2x;
                case "large" in src:
                    return src.large;
                case "medium" in src:
                    return src.medium;
                case "small" in src:
                    return src.small;
                case "portrait" in src:
                    return src.portrait;
                case "landscape" in src:
                    return src.landscape;
                case "tiny" in src:
                    return src.tiny;

                default:
                    console.warn(`The provided srcKey "${srcKey}" does not exist in the photo's src object.`);
                    return null;
            }
        }) ?? null;

        return output?.filter((item): item is string => item !== null) ?? null;
    }
}