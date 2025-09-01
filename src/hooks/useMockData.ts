import { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import { Classroom, Subject, Faculty, Batch, Timetable } from '../types';

export const useMockData = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);

  useEffect(() => {
    // Generate mock classrooms
    const mockClassrooms: Classroom[] = Array.from({ length: 15 }, (_, i) => ({
      id: faker.string.uuid(),
      name: `Room ${faker.string.alphanumeric(3).toUpperCase()}`,
      capacity: faker.number.int({ min: 30, max: 120 }),
      type: faker.helpers.arrayElement(['lecture', 'lab', 'seminar']),
      equipment: faker.helpers.arrayElements(['Projector', 'Whiteboard', 'Computer', 'Audio System', 'Air Conditioning'], { min: 2, max: 5 }),
      building: faker.helpers.arrayElement(['A Block', 'B Block', 'C Block', 'Library Block']),
      floor: faker.number.int({ min: 1, max: 4 })
    }));

    // Generate mock subjects
    const subjectNames = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'History', 'Biology', 'Economics'];
    const mockSubjects: Subject[] = Array.from({ length: 20 }, (_, i) => ({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(subjectNames) + ' ' + faker.string.alphanumeric(3).toUpperCase(),
      code: faker.string.alphanumeric(6).toUpperCase(),
      credits: faker.number.int({ min: 1, max: 4 }),
      type: faker.helpers.arrayElement(['core', 'elective', 'lab']),
      semester: faker.number.int({ min: 1, max: 8 }),
      department: faker.helpers.arrayElement(['Computer Science', 'Mathematics', 'Physics', 'Chemistry'])
    }));

    // Generate mock faculty
    const mockFaculty: Faculty[] = Array.from({ length: 12 }, (_, i) => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      department: faker.helpers.arrayElement(['Computer Science', 'Mathematics', 'Physics', 'Chemistry']),
      subjects: faker.helpers.arrayElements(mockSubjects.map(s => s.id), { min: 1, max: 3 }),
      availability: {
        'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'Wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'Friday': ['09:00', '10:00', '11:00', '14:00', '15:00']
      },
      maxHoursPerWeek: faker.number.int({ min: 15, max: 25 })
    }));

    // Generate mock batches
    const mockBatches: Batch[] = Array.from({ length: 8 }, (_, i) => ({
      id: faker.string.uuid(),
      name: `Batch ${faker.string.alphanumeric(2).toUpperCase()}-${faker.number.int({ min: 2020, max: 2024 })}`,
      semester: faker.number.int({ min: 1, max: 8 }),
      department: faker.helpers.arrayElement(['Computer Science', 'Mathematics', 'Physics', 'Chemistry']),
      strength: faker.number.int({ min: 25, max: 60 }),
      subjects: faker.helpers.arrayElements(mockSubjects.map(s => s.id), { min: 4, max: 6 })
    }));

    setClassrooms(mockClassrooms);
    setSubjects(mockSubjects);
    setFaculty(mockFaculty);
    setBatches(mockBatches);
    setTimetables([]);
  }, []);

  return {
    classrooms,
    subjects,
    faculty,
    batches,
    timetables,
    setClassrooms,
    setSubjects,
    setFaculty,
    setBatches,
    setTimetables
  };
};
