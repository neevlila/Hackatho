export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'faculty' | 'student';
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'lecture' | 'lab' | 'seminar';
  equipment: string[];
  building: string;
  floor: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  type: 'core' | 'elective' | 'lab';
  semester: number;
  department: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  availability: {
    [day: string]: string[];
  };
  maxHoursPerWeek: number;
}

export interface Batch {
  id: string;
  name: string;
  semester: number;
  department: string;
  strength: number;
  subjects: string[];
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: Subject;
  faculty?: Faculty;
  classroom?: Classroom;
  batch?: Batch;
  is_break?: boolean;
  break_name?: string;
}

export interface Timetable {
  id: string;
  name: string;
  semester: string;
  createdAt: Date;
  timeSlots: TimeSlot[];
  status: 'draft' | 'published';
}
