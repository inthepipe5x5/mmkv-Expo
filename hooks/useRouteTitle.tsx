/** @name useRouteTitle
 * @description this hook is used to return a title for the current route in a presentable format
 * @param {string} defaultTitle - the default title to use if no title is found
 */

import { useMemo, useCallback } from "react";
import { useLocalSearchParams, useSegments } from "expo-router";

export function useRouteTitle(defaultTitle: string, options: {
    case?: "upper" | "lower" | "capitalize" | "title";
} = {
        case: "title",
    }) {
    const segments = useSegments();
    const params = useLocalSearchParams();

    const formatSegmentName = useCallback((segment: string, formatOptions: {
        case?: "upper" | "lower" | "capitalize" | "title";
    } = options) => {
        //guard clause
        if (!!!segment || typeof segment !== "string") {
            console.warn("Invalid segment name:", segment);
            return {
                preParsed: segment ?? "",
                processed: defaultTitle,
            }
        }
        const { case: caseOption } = formatOptions;

        const preParsed = segment
        let processSpecialCharacters = segment.replace(/_/g, " ")
            .replace(/%20/g, " ") // Replace %20 with spaces
            .replace(/-/g, " ") // Replace dashes with spaces
            .replace(/\//g, " ") // Replace slashes with spaces
            .replace(/%28/g, "") // Remove parentheses
            .replace(/%29/g, "") // Remove parentheses
            .replace(/%5B/g, "") // Remove brackets
            .replace(/%5D/g, "") // Remove brackets
            .replace(/%3A/g, ":")
            .replace(/%2F/g, "/")
            .replace(/%3F/g, "?") // Replace %3F with ?
            .replace(/%3D/g, "=") // Replace %3D with =
            .replace(/([A-Z])/g, " $1") // Add space before capital letters
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/-/g, " ") // Replace dashes with spaces

        switch (caseOption) {
            case "upper":
                processSpecialCharacters
                    = processSpecialCharacters.toUpperCase();
                break;
            case "lower":
                processSpecialCharacters
                    = processSpecialCharacters.toLowerCase();
                break;
            case "capitalize":
                processSpecialCharacters
                    = processSpecialCharacters.charAt(0).toUpperCase() + processSpecialCharacters.slice(1);
                break;
            case "title":
                processSpecialCharacters
                    = processSpecialCharacters.replace(/\b\w/g, (char) => char.toUpperCase());
                break;
            default:
                processSpecialCharacters
                    = processSpecialCharacters;
        }
        return {
            preParsed,
            processed: processSpecialCharacters
        }

    }, []);

    const title = useMemo(() => {
        // if (segments.length === 0) return defaultTitle;
        let predictedTitle = "";
        const segment = segments[segments.length - 1];
        const prevSegment = segments[segments.length - 2];

        switch (true) {
            case segment[0] === "reset":
            case segment[0] === "new":
            case segment[0] === "add":
            case segment[0] === "edit":
            case segment[0] === "update":
            case segment[0] === "save":
            case segment[0] === "delete":
            case segment[0] === "confirm":
                predictedTitle = formatSegmentName(segment, options).processed + formatSegmentName(prevSegment, options).processed;
                break;
            case segment.includes("index"):
                predictedTitle = formatSegmentName(prevSegment, options).processed;
                break;
            //handle slugs
            case segment[0] === "[id]":
                predictedTitle = formatSegmentName(prevSegment, options).processed;
                if (!!params?.id) {
                    const id = params.id ?? "Details" as string;
                    //check if id is an array

                    predictedTitle = predictedTitle + formatSegmentName(Array.isArray(id) ? id[0] : id, options).processed;
                }
                break;

            case segment[0] === "[" && segment[segment.length - 1] === "]":
                predictedTitle = formatSegmentName(segment.slice(1, -1), options).processed;
                break;
            default:
                predictedTitle = defaultTitle;
        }
        const output = formatSegmentName(predictedTitle === defaultTitle ? defaultTitle : predictedTitle, options).processed;
        console.log("useRouteTitle output", output);
        return output;
    }, [])

    const returnValue = useMemo(() => {
        return {
            title,
            formatSegmentName,
        }
    }, []);

    return returnValue;
}