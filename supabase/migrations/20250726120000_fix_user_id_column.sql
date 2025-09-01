/*
  # [Schema Fix] Add user_id columns and update RLS policies
  This migration script fixes an issue where the `user_id` column was missing from the `timetables` and `time_slots` tables, which caused errors during timetable generation. It ensures that every record is associated with the user who created it.

  ## Query Description:
  - This script adds a `user_id` column to the `timetables` and `time_slots` tables if they don't already exist.
  - It establishes a foreign key relationship to the `auth.users` table to link records to authenticated users.
  - It updates the Row-Level Security (RLS) policies to use this new column, ensuring users can only access and manage their own data.
  - This is a non-destructive operation but essential for the application's security and functionality.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true (by dropping the column and policies)

  ## Structure Details:
  - Tables affected: `public.timetables`, `public.time_slots`
  - Columns added: `user_id` (UUID) to both tables.
  - Constraints added: Foreign key from `user_id` to `auth.users(id)`.
  - RLS Policies updated: Policies for SELECT, INSERT, UPDATE, DELETE on both tables.

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes. Policies are updated to be based on the new `user_id` column, which is a critical security enhancement.
  - Auth Requirements: Users must be authenticated to interact with these tables.

  ## Performance Impact:
  - Indexes: A foreign key index will be automatically created on the `user_id` columns, which will improve query performance for user-specific data lookups.
  - Triggers: No changes.
  - Estimated Impact: Low. The change will improve performance for secured queries.
*/

-- Add user_id column to timetables if it doesn't exist
ALTER TABLE public.timetables
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to time_slots if it doesn't exist
ALTER TABLE public.time_slots
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them safely, ensuring they are idempotent
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.timetables;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.time_slots;

-- RLS Policy for timetables: Allow users to manage their own timetables
CREATE POLICY "Enable all access for authenticated users"
ON public.timetables
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy for time_slots: Allow users to manage their own time slots
CREATE POLICY "Enable all access for authenticated users"
ON public.time_slots
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
