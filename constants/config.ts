"use strict";

/** global config file for env variables and other config variables
 * 
 */
import { remapKeys } from "@/utils/pick";

const envVariables = process.env
//env variables without the prefix of "EXPO_PUBLIC_"

export const currentEnvVariables = remapKeys(envVariables,
    Object.fromEntries(
        Object.keys(envVariables).map((key) => {
            return [key.split("EXPO_PUBLIC_")[1], key];
        })
    )
);