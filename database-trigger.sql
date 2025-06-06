-- Database trigger to automatically create pharmacist records after user signup
-- Run this in your Supabase SQL Editor

-- Function to automatically create pharmacist profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create pharmacist record if the user has the required metadata
  IF NEW.raw_user_meta_data IS NOT NULL AND 
     NEW.raw_user_meta_data->>'name' IS NOT NULL AND 
     NEW.raw_user_meta_data->>'registration_number' IS NOT NULL THEN
    
    INSERT INTO public.pharmacists (user_id, email, name, registration_number, phone, practice_name, practice_address)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'registration_number',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'practice',
      NEW.raw_user_meta_data->>'location'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create pharmacist record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.pharmacists TO authenticated; 