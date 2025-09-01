import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Classroom, Subject, Faculty, Batch, Timetable, TimeSlot } from '../types';

interface Break {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days: string[];
  user_id: string;
}

export const useSupabaseData = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching classrooms:', error);
        return;
      }
      
      console.log('Fetched classrooms:', data);
      setClassrooms(data.map(item => ({
        id: item.id,
        name: item.name,
        capacity: item.capacity,
        type: item.type,
        equipment: item.equipment || [],
        building: item.building,
        floor: item.floor
      })));
    } catch (error) {
      console.error('Error in fetchClassrooms:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching subjects:', error);
        return;
      }
      
      console.log('Fetched subjects:', data);
      setSubjects(data.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        credits: item.credits,
        type: item.type,
        semester: item.semester,
        department: item.department
      })));
    } catch (error) {
      console.error('Error in fetchSubjects:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching faculty:', error);
        return;
      }
      
      console.log('Fetched faculty:', data);
      setFaculty(data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        department: item.department,
        subjects: item.subjects || [],
        availability: item.availability || {},
        maxHoursPerWeek: item.max_hours_per_week
      })));
    } catch (error) {
      console.error('Error in fetchFaculty:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching batches:', error);
        return;
      }
      
      console.log('Fetched batches:', data);
      setBatches(data.map(item => ({
        id: item.id,
        name: item.name,
        semester: item.semester,
        department: item.department,
        strength: item.strength,
        subjects: item.subjects || []
      })));
    } catch (error) {
      console.error('Error in fetchBatches:', error);
    }
  };

  const fetchBreaks = async () => {
    try {
      const { data, error } = await supabase
        .from('breaks')
        .select('*')
        .order('start_time');
      
      if (error) {
        console.error('Error fetching breaks:', error);
        return;
      }
      
      console.log('Fetched breaks:', data);
      setBreaks(data || []);
    } catch (error) {
      console.error('Error in fetchBreaks:', error);
    }
  };

  const fetchTimetables = async () => {
    try {
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          *,
          time_slots (
            *,
            subject:subjects (*),
            faculty:faculty (*),
            classroom:classrooms (*),
            batch:batches (*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching timetables:', error);
        return;
      }
      
      console.log('Fetched timetables:', data);
      setTimetables(data.map(item => ({
        id: item.id,
        name: item.name,
        semester: item.semester,
        createdAt: new Date(item.created_at),
        status: item.status,
        timeSlots: item.time_slots.map((slot: any) => ({
          id: slot.id,
          day: slot.day,
          startTime: slot.start_time,
          endTime: slot.end_time,
          subject: slot.subject,
          faculty: slot.faculty,
          classroom: slot.classroom,
          batch: slot.batch
        }))
      })));
    } catch (error) {
      console.error('Error in fetchTimetables:', error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchClassrooms(),
          fetchSubjects(),
          fetchFaculty(),
          fetchBatches(),
          fetchBreaks(),
          fetchTimetables()
        ]);
      } catch (error) {
        console.error('Error fetching all data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const refreshData = async () => {
    try {
      await Promise.all([
        fetchClassrooms(),
        fetchSubjects(),
        fetchFaculty(),
        fetchBatches(),
        fetchBreaks(),
        fetchTimetables()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return {
    classrooms,
    subjects,
    faculty,
    batches,
    timetables,
    breaks,
    loading,
    refreshData,
    setClassrooms,
    setSubjects,
    setFaculty,
    setBatches,
    setTimetables,
    setBreaks
  };
};
