import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseKey);

// We still attach it to window for temporary backward compatibility while migrating scripts
window.supabaseClient = supabase;

export async function checkAuthSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error al comprobar sesión:", error);
        return null;
    }
    return data.session;
}

window.checkAuthSession = checkAuthSession;
