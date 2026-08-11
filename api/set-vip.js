export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id, isVip, adminPin } = req.body;

    // Verify the admin PIN for this API endpoint
    const validPin = process.env.ADMIN_PIN || 'WGM2026!';
    if (adminPin !== validPin) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
    }

    if (!id) {
        return res.status(400).json({ error: 'Bad Request: Missing user ID' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oamabkprzvlvjgngdfes.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.");
        return res.status(500).json({ error: 'Internal Server Error: Missing Service Role Key' });
    }

    try {
        // Use the Supabase REST API directly with the Service Role Key
        // The service role key bypasses RLS and allows us to update the registration
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/registrations?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                is_vip: !!isVip
            })
        });

        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            console.error("Supabase update error:", errorText);
            return res.status(500).json({ error: 'Failed to update VIP status in database' });
        }

        const data = await updateRes.json();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
