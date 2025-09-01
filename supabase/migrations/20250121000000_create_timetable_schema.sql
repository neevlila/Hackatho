/*
# Smart Classroom & Timetable Scheduler Database Schema
Creates the complete database structure for the timetable management system including
classrooms, subjects, faculty, batches, and timetable generation.

## Query Description: 
This migration creates the foundational database structure for a smart classroom scheduling system.
It includes tables for managing classrooms, subjects, faculty members, student batches, and 
generated timetables with time slots. This is a safe structural operation that creates new tables
without affecting existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
Creates tables: classrooms, subjects, faculty, batches, timetables, time_slots
Includes proper relationships, constraints, and indexes for optimal performance

## Security Implications:
- RLS Status: Enabled on all public tables
- Policy Changes: Yes - Basic CRUD policies added
- Auth Requirements: Authenticated users only

## Performance Impact:
- Indexes: Added on foreign keys and commonly queried fields
- Triggers: None in this migration
- Estimated Impact: Minimal - new table creation only
*/

-- Enable RLS
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create classrooms table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('lecture', 'lab', 'seminar')),
    equipment TEXT[] DEFAULT '{}',
    building VARCHAR(100) NOT NULL,
    floor INTEGER NOT NULL CHECK (floor > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    credits INTEGER NOT NULL CHECK (credits >= 1 AND credits <= 10),
    type VARCHAR(20) NOT NULL CHECK (type IN ('core', 'elective', 'lab')),
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faculty table
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    subjects TEXT[] DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    max_hours_per_week INTEGER NOT NULL DEFAULT 20 CHECK (max_hours_per_week > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    department VARCHAR(100) NOT NULL,
    strength INTEGER NOT NULL CHECK (strength > 0),
    subjects TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_id UUID NOT NULL REFERENCES public.timetables(id) ON DELETE CASCADE,
    day VARCHAR(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classrooms_type ON public.classrooms(type);
CREATE INDEX IF NOT EXISTS idx_classrooms_building ON public.classrooms(building);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON public.subjects(department);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON public.faculty(department);
CREATE INDEX IF NOT EXISTS idx_batches_semester ON public.batches(semester);
CREATE INDEX IF NOT EXISTS idx_batches_department ON public.batches(department);
CREATE INDEX IF NOT EXISTS idx_time_slots_timetable ON public.time_slots(timetable_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_day ON public.time_slots(day);

-- Enable Row Level Security
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.classrooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.classrooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.classrooms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON public.classrooms FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.subjects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON public.subjects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.faculty FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.faculty FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON public.faculty FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.batches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.batches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON public.batches FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.timetables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.timetables FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.timetables FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON public.timetables FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.time_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.time_slots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.time_slots FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON public.time_slots FOR DELETE TO authenticated USING (true);

-- Insert sample data
INSERT INTO public.classrooms (name, capacity, type, equipment, building, floor) VALUES
('A-101', 60, 'lecture', '{"Projector", "Whiteboard", "Audio System"}', 'A Block', 1),
('A-102', 45, 'lecture', '{"Projector", "Whiteboard"}', 'A Block', 1),
('B-201', 80, 'lecture', '{"Projector", "Whiteboard", "Audio System", "Air Conditioning"}', 'B Block', 2),
('C-301', 30, 'lab', '{"Computers", "Projector", "Whiteboard"}', 'C Block', 3),
('C-302', 25, 'lab', '{"Computers", "Projector"}', 'C Block', 3),
('D-401', 40, 'seminar', '{"Projector", "Whiteboard", "Audio System"}', 'D Block', 4);

INSERT INTO public.subjects (name, code, credits, type, semester, department) VALUES
('Data Structures and Algorithms', 'CS201', 4, 'core', 3, 'Computer Science'),
('Database Management Systems', 'CS301', 3, 'core', 5, 'Computer Science'),
('Computer Networks', 'CS302', 3, 'core', 5, 'Computer Science'),
('Software Engineering', 'CS401', 4, 'core', 7, 'Computer Science'),
('Machine Learning', 'CS501', 3, 'elective', 7, 'Computer Science'),
('Web Development Lab', 'CS502L', 2, 'lab', 6, 'Computer Science');

INSERT INTO public.faculty (name, email, department, max_hours_per_week) VALUES
('Dr. John Smith', 'john.smith@university.edu', 'Computer Science', 20),
('Dr. Sarah Johnson', 'sarah.johnson@university.edu', 'Computer Science', 18),
('Prof. Michael Brown', 'michael.brown@university.edu', 'Computer Science', 22),
('Dr. Emily Davis', 'emily.davis@university.edu', 'Computer Science', 20);

INSERT INTO public.batches (name, semester, department, strength) VALUES
('CS-2022-A', 5, 'Computer Science', 45),
('CS-2022-B', 5, 'Computer Science', 42),
('CS-2021-A', 7, 'Computer Science', 38),
('CS-2023-A', 3, 'Computer Science', 50);
