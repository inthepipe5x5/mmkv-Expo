import { z } from "zod";
/**
 * @description This file contains the schemas for the authentication process.
 */

// enum of sso providers
export const OauthProviderEnum = z.enum([
    "google",
    "facebook", // not set up yet
    "apple", // not set up yet
    // "github",
    // "twitter",
]);

//terms of service and privacy policy
export const termsOfServiceSchema = z.object({
    accepted: z.boolean().default(false),
    // date: z.string().datetime({ offset: true }).nullable().optional().default(new Date().toISOString()),
});

export const preferencesSchema = z.object({
    theme: z.enum(["light", "dark", "system"]).default("light"),
    fontSize: z.enum(["medium", "large", "x-large"]).optional().default("medium"),
    fontFamily: z.enum(["default", "serif", "sans-serif", "monospace"]).optional().default("default"),
    boldText: z.boolean().optional().default(false),
    highContrast: z.boolean().optional().default(false),
    reduceMotion: z.boolean().optional().default(false),
    screenReaderEnabled: z.boolean().optional().default(false),
    hapticFeedback: z.boolean().optional().default(true),
    notificationsEnabled: z.boolean().optional().default(true),
    soundEffects: z.boolean().optional().default(true),
    language: z.string().optional().default("en"),
    autoPlayVideos: z.boolean().optional().default(false),
    dataUsage: z.enum(["low", "normal", "high"]).optional().default("normal"),
    colorBlindMode: z.enum(["none", "protanopia", "deuteranopia", "tritanopia"]).optional().default("none"),
    textToSpeechRate: z.number().optional().default(1),
    zoomLevel: z.number().optional().default(1),
    rememberMe: z.boolean().default(false),
    cameraPermissions: z.boolean().optional().default(false),
    microphonePermissions: z.boolean().optional().default(false),
    locationPermissions: z.boolean().optional().default(false),
});

export const hiddenMetaSection = z.object({
    user_id: z.string().uuid().nullable().optional().default(() => new Crypto().getRandomValues(new Uint32Array(1))[0].toString()),
    created_at: z.string().datetime({ offset: true }).nullable().optional().default(new Date().toISOString()),
    app_metadata: z.object({
        avatarUrl: z.string().url().optional(),
        isSuperAdmin: z.boolean(),
        ssoUser: z.boolean(),
        provider: OauthProviderEnum.optional(),
        setup: z.object({
            email: z.boolean().nullable().optional().default(false),
            authenticationMethod: z.boolean().nullable().optional().default(false),
            account: z.boolean().nullable().optional().default(false),
            details: z.boolean().nullable().optional().default(false),
            preferences: z.boolean().nullable().optional().default(false),
            confirmation: z.boolean().nullable().optional().default(false),
        }).optional(),
        authMetaData: z.any().optional(),
    }).nullable().optional(),
    draftStatus: z.enum([
        "draft",
        "confirmed",
        "published",
        "archived",
        "deleted",
    ]).default("draft"),
});



/**
 * Schema for reseting passwords.
 */
//#region Reset pw
const baseResetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Please enter fewer than 64 characters.")
        .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
        .regex(new RegExp(".*[a-z].*"), "One lowercase character")
        .regex(new RegExp(".*\\d.*"), "One number")
        .regex(
            new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
            "One special character"
        ),
    confirmPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
        .regex(new RegExp(".*[a-z].*"), "One lowercase character")
        .regex(new RegExp(".*\\d.*"), "One number")
        .regex(
            new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
            "One special character"
        ),
});

export const resetPasswordSchema = baseResetPasswordSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords must match",
        path: ["confirmPassword"],
    }
);
//#endregion Reset Password
//#region Login 
//email
//password
//remember me
export const passwordLoginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters"),
    rememberMe: z.boolean().default(false),

})
    .merge(baseResetPasswordSchema
        .pick({ password: true }))
// .merge(preferencesSchema.pick({ rememberMe: true }));

//#endregion Login
//#region Register
//email
//password
//confirmPassword
//remember me
//passwords must match
export const simpleCreateUserSchema = passwordLoginSchema
    .merge(baseResetPasswordSchema
        .pick({ confirmPassword: true }))
    .merge(termsOfServiceSchema)
    .refine(
        (data) => data.password === data.confirmPassword,
        { message: "Passwords must match", path: ["confirmPassword"] }
    );
// #endregion Register


export const requestResetSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters")
});