-- Disable RLS temporarily
ALTER TABLE IF EXISTS public.generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.generations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    provider TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create generations table
CREATE TABLE public.generations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    story_prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    is_daily BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX idx_generations_is_daily ON public.generations(is_daily);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Generations are viewable by everyone"
    ON public.generations FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own generations"
    ON public.generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
    ON public.generations FOR UPDATE
    USING (auth.uid() = user_id);

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _provider TEXT;
    _full_name TEXT;
    _avatar_url TEXT;
BEGIN
    -- Determine the auth provider
    _provider := COALESCE(NEW.raw_user_meta_data->>'provider', 'email');
    
    -- Handle different metadata formats
    IF _provider = 'google' THEN
        _full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name',
            split_part(NEW.email, '@', 1)
        );
        _avatar_url := COALESCE(
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'avatar_url'
        );
    ELSE
        _full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        );
        _avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    END IF;

    -- Insert or update profile
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        provider,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        _full_name,
        _avatar_url,
        _provider,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        provider = EXCLUDED.provider,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation and updates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Sync existing users
DO $$
BEGIN
    -- Sync all existing users to profiles
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, created_at, updated_at)
    SELECT 
        id,
        email,
        COALESCE(
            raw_user_meta_data->>'full_name',
            raw_user_meta_data->>'name',
            split_part(email, '@', 1)
        ) as full_name,
        COALESCE(
            raw_user_meta_data->>'picture',
            raw_user_meta_data->>'avatar_url'
        ) as avatar_url,
        COALESCE(raw_user_meta_data->>'provider', 'email') as provider,
        created_at,
        last_sign_in_at
    FROM auth.users
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        provider = EXCLUDED.provider,
        updated_at = now();
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';