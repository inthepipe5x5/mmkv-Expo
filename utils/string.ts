/**
 * 
 * @param str 
 * @returns @param str that has been un-snake cased and capitalized on each word
 */
export const capitalizeSnakeCaseInputName = (str: string) => {
    return str.split(str.includes("_") ? "_" : " ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

/**
 * Capitalizes the first letter of each word in a given string.
 * Handles both single-word and multi-word strings.
 * Multi-word strings can be separated by various characters such as 
 * underscores, spaces, hyphens, slashes, dots, commas, semicolons, colons, 
 * pipes, parentheses, brackets, and braces.
 *
 * @param {string} str - The input string to be capitalized.
 * @returns {string} - The capitalized string.
 */
export const capitalize = (str: string): string => {
    const splitterCharArray = ["_", " ", "-", "/", ".", ",", ";", ":", "|", "(", ")", "[", "]", "{", "}"];
    //handle single word strings
    if (!str.includes(" ")) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    //handle multi-word strings
    let splitStr = "";
    for (let i = 0; i < splitterCharArray.length; i++) {
        if (str.includes(splitterCharArray[i])) {
            splitStr = splitterCharArray[i];
            break;
        }
    }
    return str.split(splitStr).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

/**
 * Converts a snake_case string to camelCase.
 * @param {string} snakeCaseStr - The string to convert.
 * @returns {string} The converted string in camelCase.
 */
export const convertSnakeToCamel = (snakeCaseStr: string): string => {
    // Guard clause: Return the original string if it is not a non-empty string.
    if (!snakeCaseStr || typeof snakeCaseStr !== "string") return snakeCaseStr;

    // Replace underscores followed by lowercase letters with the uppercase version of the letter.
    return snakeCaseStr.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converts a camelCase string to snake_case.
 * @param {string} camelCaseStr - The string to convert.
 * @returns {string} The converted string in snake_case.
 */
export const convertCamelToSnake = (camelCaseStr: string): string => {
    // Guard clause: Return the original string if it is not a non-empty string.
    if (!camelCaseStr || typeof camelCaseStr !== "string") return camelCaseStr;

    // Insert underscores before uppercase letters and convert to lowercase.
    return camelCaseStr.replace(
        /([A-Z])/g,
        (match: string, letter: string) => `_${letter.toLowerCase()}`
    );
};
/**
 * Converts the keys of an object using a provided conversion function.
 * Optionally, picks only specified keys from the object.
 * 
 * @template T - The type of the source object.
 * @param {T} sourceObject - The source object whose keys are to be converted.
 * @param {(key: string) => string} [convertFn=convertCamelToSnake] - The function to convert the keys.
 * @param {Array<keyof T>} [keysToPick] - An optional array of keys to pick from the source object.
 * @returns {Partial<T>} A new object with converted keys and optionally picked keys.
 * 
 * @example
 * const source = { firstName: 'John', lastName: 'Doe' };
 * const result = convertObjectKeys(source, convertCamelToSnake);
 * // result is { first_name: 'John', last_name: 'Doe' }
 * 
 * @example
 * const source = { firstName: 'John', lastName: 'Doe', age: 30 };
 * const result = convertObjectKeys(source, convertCamelToSnake, ['firstName', 'age']);
 * // result is { first_name: 'John', age: 30 }
 */
export const convertObjectKeys = <T extends object>(
    sourceObject: T,
    convertFn: (key: string) => string = convertCamelToSnake,
    keysToPick?: Array<keyof T>
): Partial<T> => {
    const result = {} as Partial<T>;
    const keys = keysToPick ? keysToPick : (Object.keys(sourceObject) as Array<keyof T>);

    keys.forEach(key => {
        const newKey = convertFn(key as string);
        result[newKey as keyof T] = sourceObject[key];
    });

    return result;
};