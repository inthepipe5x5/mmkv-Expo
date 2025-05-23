//complete new user registration

import supabase from "@/lib/supabase/supabase"
import { access_level } from "@/constants/sessionDefaults";
import { household, inventory, user_households } from "@/constants/sessionDefaults";
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { isExpired } from "@/utils/date";

// /**
//  * Completes the registration process by updating the automatically created barebones entry 
//  * in the `public.profiles` table. This entry is initially created by the Supabase trigger 
//  * `create_profile_from_auth_trigger` upon a new entry in `auth.user`.
//  * 
//  * The function updates the profile with additional user details such as preferences, 
//  * metadata, and timestamps.
//  * 
//  * @param newUser - The user profile data to be updated in the `public.profiles` table.
//  * @param sso_user - A boolean indicating if the user is a Single Sign-On (SSO) user.
//  * @returns The updated user profile data.
//  * @throws Will throw an error if there is an issue inserting/updating the user profile.
//  */
// export const completeUserProfile = async (newUser: userProfile, sso_user: boolean) => {
//     try {
//         if (!newUser || newUser === null) return; // return if no user data

//         // set default values
//         sso_user = ((newUser?.app_metadata?.sso_user) ?? sso_user) || false;
//         newUser.app_metadata = { ...(newUser?.app_metadata ?? {}), sso_user };//, setup: defaultProfileSetup};
//         newUser.preferences = { ...(newUser?.preferences ?? {}), ...defaultUserPreferences };
//         newUser.created_at = newUser?.created_at ? newUser.created_at : new Date().toISOString();

//         // register new user into public.profiles table with upsert
//         const { data, error } = await supabase
//             .from('profiles')
//             .upsert(newUser, {
//                 onConflict: 'user_id,email', //Comma-separated UNIQUE column(s) to specify how duplicate rows are determined. Two rows are duplicates if all the onConflict columns are equal.
//                 ignoreDuplicates: false, //set false to merge duplicate rows
//             })
//             .select()
//             .limit(1);

//         if (error) {
//             throw new Error(`Error inserting/updating user: ${error.message}`);
//         }

//         return data;
//     } catch (error: any) {
//         console.error('Error creating profile:', error.message);
//     }

// }

export type InviteMetaData = {
    household_id: string | null,
    invited_by: string | null,
    invited_at: string | null,
    access_level: access_level | null,
}

/** Function to check a newly created auth.user record's meta_data for details of an invite to an existing household
 *  Data about a household invite is potentially stored in the auth.user's app_metadata field.
 *  This function checks the app_metadata field for the presence of a household invite and returns the household_id if found.
 */
export const checkAppMetaDataForHouseholdInvite = async (authUser?: User) => {
    if (!!!authUser) return null; // return if no user data
    const { user_metadata, app_metadata, invited_at } = authUser || {} as User;
    // check if the invite is fresh (within 7 days) and if fresh, return the date of the invite
    const freshInvite = isExpired((invited_at ?? "") as string, 7 * 24 * 60 * 60 * 1000) ? null : new Date(`${invited_at ?? ""}`).toString();

    const initialData: InviteMetaData = {
        household_id: null,
        invited_by: null,
        invited_at: freshInvite ?? null,
        access_level: null,
    };

    switch (true) {
        case !!user_metadata && typeof user_metadata?.household_id === "string":
            initialData.household_id = user_metadata?.household_id;
            initialData.invited_by = user_metadata?.invited_by ?? null;
            initialData.invited_at = user_metadata?.invited_at ?? null;
            initialData.access_level = user_metadata?.access_level ?? null;
            break;

        case !!app_metadata && typeof app_metadata?.household_id === "string":
            initialData.household_id = app_metadata?.household_id;
            initialData.invited_by = app_metadata?.invited_by ?? null;
            initialData.invited_at = app_metadata?.invited_at ?? null;
            initialData.access_level = app_metadata?.access_level ?? null;
            break;

        default:
            return initialData;
    }
    console.log("checkAppMetaDataForHouseholdInvite", JSON.stringify({ authUser, initialData }, null, 2));
    return initialData as InviteMetaData;
};

/**
 * Inserts a user into the user_households joint table.
 * 
 * @param user_id - The ID of the user.
 * @param household_id - The ID of the existing household.
 * @returns The inserted entry from the user_households table.
 * @throws Will throw an error if there is an issue inserting the entry.
 */
export const addUserToHousehold = async (
    { user_id, household_id, invited_at }: Partial<user_households>) => {
    try {

        const { data, error } = await supabase
            .from('user_households')
            .upsert({
                user_id,
                household_id,
                invited_at,
                role: "member",
                invite_accepted: true,
                // accepted_at: new Date().toDateString(),
                options: {
                    onConflict: ["household_id", "user_id"],
                    ignoreDuplicates: true
                }
            })
            .select()
            .limit(1);

        if (error) {
            throw new Error(`Error inserting user into household: ${error.message}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error adding user to household:', error.message);
    }
};

/**
 * Creates a new household and associates it with a user, then inserts inventories.
 * 
 * @param user_id - The ID of the user.
 * @param newHouseholdData - The data for the new household.
 * @param inventories_data - The data for the new inventories.
 * @returns The new household entry with associated inventories.
 * @throws Will throw an error if there is an issue creating the household or inventories.
 */
export const createHouseholdWithInventories = async (user_id: string, newHouseholdData: Partial<household>, inventories_data: Partial<inventory>[]) => {
    try {
        if (!user_id || !newHouseholdData || !inventories_data) {
            throw new Error('User ID, household data, and inventories data are required.');
        }

        const { data: householdData, error: householdError } = await supabase
            .from('households')
            .upsert({
                ...newHouseholdData,
                is_template: false,
                draft_status: "confirmed",
                created_at: new Date().toISOString(),
            } as Partial<household>, {
                onConflict: 'name', // Specify the unique constraint to avoid duplicates
                ignoreDuplicates: false, // Set to false to merge duplicate rows
            })
            .select()
            .limit(1);

        if (householdError) {
            throw new Error(`Error creating household: ${householdError.message}`);
        }

        const household = householdData[0] ?? null;
        //insert entry into the user_households join table
        await addUserToHousehold({ user_id, household_id: household.id });

        const newInventories = inventories_data.map(inventory => ({
            ...inventory,
            household_id: household.id,
            is_template: false,
            draft_status: "draft"
        }));

        const { data: inventoriesData, error: inventoriesError } = await supabase
            .from('inventories')
            .insert(newInventories)
            .select();

        if (inventoriesError) {
            throw new Error(`Error creating inventories: ${inventoriesError.message}`);
        }

        return { household, inventories: inventoriesData };
    } catch (error: any) {
        console.error('Error creating household with inventories:', error.message);
    }
};

/**
 * Searches for household and inventory templates.
 * 
 * @returns The household templates with associated inventories.
 * @throws Will throw an error if there is an issue fetching the templates.
 */
export const getHouseholdAndInventoryTemplates = async () => {
    try {
        const [households, inventories] = await Promise.all([
            supabase
                .from('households')
                .select()
                .match({ is_template: true, draft_status: 'published' }),
            supabase
                .from('inventories')
                .select()
                .match({ is_template: true, draft_status: 'published' })
        ]);
        if (households.error) {
            throw new Error(`Error fetching household templates: ${households.error.message}`);
        }
        if (inventories.error) {
            throw new Error(`Error fetching inventory templates: ${inventories.error.message}`);
        }
        console.log(JSON.stringify({ households, inventories }, null, 4));
        return {
            households,
            inventories
        }
    } catch (error: any) {
        console.error('Error fetching household and inventory templates');
        throw new Error(`Error fetching household and inventory templates: ${error?.message ?? "No error message"}`);
    };
}
/**
 * Searches for product and inventory templates with specific criteria using a SQL join.
 * @param productCategories - The criteria to filter the templates.
 * @returns The product and inventory templates matching the criteria.
 * @throws Will throw an error if there is an issue fetching the templates.
 */
export const getProductAndInventoryTemplates = async (productCategories: string[] = ['food', 'beauty', 'personal care', 'petfood', 'pet']) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                products.*,
                inventories:inventories(*)
            `)
            // .innerJoin('inventories', 'products.product_category', 'inventories.category')
            .in('products.product_category', productCategories)
            .eq('products.draft_status', 'published')
            .eq('products.is_template', true)
            .eq('inventories.is_template', true);

        if (error) {
            throw new Error(`Error fetching product and inventory templates: ${error.message}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error fetching product and inventory templates:', error.message);
    }
};

/**
 * Searches for household templates by ID.
 * 
 * @param new_user_id - The ID of the newly created user to insert household & inventory templates for.
 * @returns the inserted household & inventory id template with the associated new user id.
 * @throws Will throw an error if there is an issue inserting the template.
 */

export const insertHouseholdInventoryTemplates = async (new_user_id: string) => {
    if (!!!new_user_id) {
        throw new Error('User ID is required to insert household and inventory templates.');
    }

    return await supabase.rpc('insert_templated_household_and_inventories', { new_user_id });
}