// js/supabase-client.js

// Usamos la librería Supabase cargada globalmente desde el CDN (window.supabase)
const supabaseUrl = 'https://oamabkprzvlvjgngdfes.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbWFia3ByenZsdmpnbmdkZmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzQ5NzUsImV4cCI6MjEwMTE1MDk3NX0.RTcRVkRsjbhZdJPzkuC1Xebro3kCF54fs09KoWwHIOw';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabase;

// Helper function to check session globally
window.checkAuthSession = async function checkAuthSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error al comprobar sesión:", error);
        return null;
    }
    return data.session;
};
