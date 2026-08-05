const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://oamabkprzvlvjgngdfes.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbWFia3ByenZsdmpnbmdkZmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzQ5NzUsImV4cCI6MjEwMTE1MDk3NX0.RTcRVkRsjbhZdJPzkuC1Xebro3kCF54fs09KoWwHIOw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignUp() {
    console.log('Attempting sign up...');
    const { data, error } = await supabase.auth.signUp({
        email: 'test_registration_' + Date.now() + '@camilafran.cl',
        password: 'password123',
        options: {
            data: { full_name: 'Test User' }
        }
    });
    
    if (error) {
        console.log('Error object:', error);
        console.log('Error stringified:', JSON.stringify(error));
        console.log('Error message:', error.message);
    } else {
        console.log('Sign up successful:', data.user.id);
    }
}
testSignUp();
