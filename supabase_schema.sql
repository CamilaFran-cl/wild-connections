-- Create the registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    location TEXT,
    instagram TEXT,
    
    business_stage TEXT,
    monthly_revenue TEXT,
    business_years TEXT,
    delivery_model TEXT[],
    team_size TEXT,
    
    challenge_90days TEXT,
    pain_points TEXT[],
    
    niche TEXT,
    expertise TEXT,
    target_audience TEXT[],
    ideal_client TEXT,
    main_offer_price TEXT,
    
    needs_to_hire TEXT[],
    microphone_pitch TEXT,
    
    hobbies TEXT[],
    social_energy TEXT,
    human_design TEXT,
    my_person_criteria TEXT,
    
    next_objective TEXT,
    three_year_vision TEXT,
    event_expectation TEXT,
    purchase_reason TEXT[],
    
    auth_directory BOOLEAN DEFAULT false,
    auth_matchmaking BOOLEAN DEFAULT false,
    additional_notes TEXT,
    
    profile_photo_url TEXT,
    
    form_complete BOOLEAN DEFAULT false,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (anon access for registration)
CREATE POLICY "Allow public insert on registrations"
ON public.registrations
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy to allow anyone to read (anon access for matches/directory)
CREATE POLICY "Allow public read on registrations"
ON public.registrations
FOR SELECT
TO anon
USING (true);

-- Policy to allow update on own record (based on email)
CREATE POLICY "Allow update on own registration"
ON public.registrations
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
