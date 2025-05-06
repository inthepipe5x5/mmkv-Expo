import { z } from "zod";
import { hiddenMetaSection } from "@/lib/schemas/auth.schemas";
import { defaultUserPreferences } from "@/constants/preferences";

//user locale data
export const locationSchema = z.object({
    city: z
        .string()
        .min(1, "City is required")
        .max(100, "City must be less than 100 characters")
        .default("Toronto"),
    state: z
        .string()
        .min(1, "State is required")
        .max(100, "State must be less than 100 characters")
        .default("ON"),
    country: z
        .string()
        .min(1, "Country is required")
        .max(3, "Country code must be less than 3 characters")
        .default("Canada"),
    postalcode: z
        .string()
        .min(1, "Postal Code is required")
        .max(20, "Postal Code must be less than 20 characters")
        .default("m4c1b5"),
});

const userContactSchema = z.object({
    firstName: z.string().min(1, "First name is required").default("John"),
    lastName: z.string().min(1, "Last name is required").default("Doe"),
    name: z.string().min(1, "Name is too short").optional().default("John Doe"),
    email: z.string().email("Invalid email address").default("example@example.com"),
    phoneNumber: z
        .string()
        .regex(
            /^\+?[1-9]\d{1,14}$/,
            "Phone number must be a valid international phone number"
        )
        .optional(),
})

export const userSchema = z.object({
    avatar_url: z.string().url().optional(),
    preferences: z.object({}).optional().default(defaultUserPreferences),
    // created_at: z.string().datetime({ offset: true }).nullable().optional().default(new Date().toISOString()),
})
    .merge(userContactSchema)
    .extend(locationSchema.shape)
    // .extend(passwordLoginSchema.shape)
    .extend(hiddenMetaSection.shape)

