import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Download, 
  Plus, 
  Trash2,
  Users,
  BookOpen,
  MapPin,
  Coffee
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import { Timetable } from '../types';
import { exportTimetableToPDF, exportTimetableToExcel } from '../utils/exportUtils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const TimetableViewer: React.FC = () => {
  const { subjects, faculty, classrooms, batches, timetables, breaks, refreshData, loading: dataLoading } = useSupabaseData();
  const { user, isDemoUser } = useAuth();
  const { theme } = useTheme();
  const [selectedSemester, setSelectedSemester] = useState('5');
  const [currentTimetable, setCurrentTimetable] = useState<Timetable | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Find the latest timetable for the selected semester on initial load or when data changes
    const latestTimetableForSemester = timetables
      .filter(t => t.semester.toString() === selectedSemester)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    setCurrentTimetable(latestTimetableForSemester || null);
  }, [timetables, selectedSemester]);

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const generateTimetable = async () => {
    setIsGenerating(true);

    if (isDemoUser) {
      alert('Timetable generation is disabled for the demo user. This feature requires a real user account to interact with the database.');
      setIsGenerating(false);
      return;
    }
    
    if (!user) {
      alert('You must be logged in to generate a timetable.');
      setIsGenerating(false);
      return;
    }

    // Check if we have the required data
    if (classrooms.length === 0) {
      alert('No classrooms found. Please add classrooms first.');
      setIsGenerating(false);
      return;
    }

    if (subjects.length === 0) {
      alert('No subjects found. Please add subjects first.');
      setIsGenerating(false);
      return;
    }

    if (faculty.length === 0) {
      alert('No faculty found. Please add faculty first.');
      setIsGenerating(false);
      return;
    }

    if (batches.length === 0) {
      alert('No batches found. Please add batches first.');
      setIsGenerating(false);
      return;
    }

    const targetBatch = batches.find(b => b.semester.toString() === selectedSemester);
    if (!targetBatch) {
      alert(`No student batch found for Semester ${selectedSemester}. Please create one first.`);
      setIsGenerating(false);
      return;
    }

    const batchSubjects = subjects.filter(s => targetBatch.subjects.includes(s.id));
    if (batchSubjects.length === 0) {
        alert(`The selected batch (${targetBatch.name}) is not enrolled in any subjects. Please assign subjects to the batch first.`);
        setIsGenerating(false);
        return;
    }
    
    try {
      console.log('Starting timetable generation with:', {
        classrooms: classrooms.length,
        subjects: subjects.length,
        faculty: faculty.length,
        batches: batches.length,
        targetBatch,
        batchSubjects: batchSubjects.length
      });

      // --- IMPROVED TIMETABLE GENERATION ALGORITHM ---
      const potentialTimeSlots: any[] = [];
      const usedFacultySlots = new Set<string>(); // "day-time-facultyId"
      const usedClassroomSlots = new Set<string>(); // "day-time-classroomId"
      const usedBatchSlots = new Set<string>(); // "day-time" for the batch

      // 1. Calculate difficulty score for each subject
      const subjectsWithDifficulty = batchSubjects.map(subject => {
        const qualifiedFacultyCount = faculty.filter(f => f.subjects.includes(subject.id)).length;
        const suitableClassroomsCount = classrooms.filter(c => 
          c.capacity >= targetBatch.strength && 
          (subject.type === 'lab' ? c.type === 'lab' : c.type !== 'lab')
        ).length;
        
        const facultyScore = qualifiedFacultyCount > 0 ? 1 / qualifiedFacultyCount : 100;
        const classroomScore = suitableClassroomsCount > 0 ? 1 / suitableClassroomsCount : 100;

        if (qualifiedFacultyCount === 0) {
            console.warn(`No faculty assigned to teach subject: ${subject.name}. It cannot be scheduled.`);
        }
        if (suitableClassroomsCount === 0) {
            console.warn(`No suitable classroom found for subject: ${subject.name} (Capacity: ${targetBatch.strength}, Type: ${subject.type}). It cannot be scheduled.`);
        }

        return {
            subject,
            difficulty: facultyScore + classroomScore
        };
      });

      // 2. Sort subjects by difficulty (hardest first)
      const subjectsToSchedule = subjectsWithDifficulty
        .sort((a, b) => b.difficulty - a.difficulty)
        .map(item => item.subject);

      const allPossibleSlots = days.flatMap(day => 
        timeSlots.slice(0, 6).map(time => ({ day, time }))
      );
      
      // Shuffle slots to introduce some variation
      allPossibleSlots.sort(() => Math.random() - 0.5); 

      // 3. Schedule subjects in order of difficulty
      for (const subject of subjectsToSchedule) {
        let isScheduled = false;
        for (const slot of allPossibleSlots) {
          const { day, time } = slot;
          const batchSlotKey = `${day}-${time}`;

          if (usedBatchSlots.has(batchSlotKey)) continue;

          const qualifiedFaculty = faculty.filter(f => f.subjects.includes(subject.id));
          const availableFaculty = qualifiedFaculty.find(f => !usedFacultySlots.has(`${day}-${time}-${f.id}`));

          if (!availableFaculty) continue;

          const suitableClassrooms = classrooms.filter(c => 
            c.capacity >= targetBatch.strength && 
            (subject.type === 'lab' ? c.type === 'lab' : c.type !== 'lab')
          );
          const availableClassroom = suitableClassrooms.find(c => !usedClassroomSlots.has(`${day}-${time}-${c.id}`));

          if (!availableClassroom) continue;
          
          isScheduled = true;
          
          potentialTimeSlots.push({
            day,
            start_time: time.split(' - ')[0],
            end_time: time.split(' - ')[1],
            subject_id: subject.id,
            faculty_id: availableFaculty.id,
            classroom_id: availableClassroom.id,
            batch_id: targetBatch.id,
            user_id: user.id
          });

          usedBatchSlots.add(batchSlotKey);
          usedFacultySlots.add(`${day}-${time}-${availableFaculty.id}`);
          usedClassroomSlots.add(`${day}-${time}-${availableClassroom.id}`);

          break; // Move to the next subject
        }

        if (!isScheduled) {
            console.warn(`Could not schedule subject: ${subject.name} (${subject.code}). All slots were busy or no resources were available.`);
        }
      }

      // 4. Add breaks to the timetable
      const userBreaks = breaks.filter(b => b.user_id === user.id);
      for (const breakItem of userBreaks) {
        for (const day of breakItem.days) {
          const breakSlot = {
            day,
            start_time: breakItem.start_time,
            end_time: breakItem.end_time,
            subject_id: null,
            faculty_id: null,
            classroom_id: null,
            batch_id: targetBatch.id,
            user_id: user.id,
            is_break: true,
            break_name: breakItem.name
          };
          potentialTimeSlots.push(breakSlot);
        }
      }

      console.log('Generated time slots:', potentialTimeSlots);
      // --- END OF ALGORITHM ---

      if (potentialTimeSlots.length === 0) {
        alert('Could not generate a timetable. No available slots found. Please check your data: ensure faculty are assigned to subjects, batches are enrolled in subjects, and classrooms have enough capacity.');
        setIsGenerating(false);
        return;
      }

      // Create the main timetable record
      const { data: timetableData, error: timetableError } = await supabase
        .from('timetables')
        .insert([{
          name: `Semester ${selectedSemester} Timetable - ${new Date().toLocaleDateString()}`,
          semester: selectedSemester,
          status: 'draft',
          user_id: user.id
        }])
        .select()
        .single();

      if (timetableError) throw timetableError;

      // Associate slots with the new timetable and insert them
      const finalTimeSlots = potentialTimeSlots.map(slot => ({ ...slot, timetable_id: timetableData.id }));
      const { error: slotsError } = await supabase.from('time_slots').insert(finalTimeSlots);

      if (slotsError) {
        await supabase.from('timetables').delete().eq('id', timetableData.id);
        throw slotsError;
      }

      alert('Timetable generated successfully!');
      await refreshData();
      
    } catch (error: any) {
      console.error('Error generating timetable:', error);
      alert(`Error generating timetable: ${error.message}. Please check console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTimetable = async (timetableId: string) => {
    if (window.confirm('Are you sure you want to delete this timetable? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('timetables')
          .delete()
          .eq('id', timetableId);

        if (error) throw error;
        
        alert('Timetable deleted successfully.');
        setCurrentTimetable(null);
        await refreshData();
      } catch (error: any) {
        console.error('Error deleting timetable:', error);
        alert(`Error deleting timetable: ${error.message}`);
      }
    }
  };

  const getTimetableSlot = (day: string, time: string) => {
    if (!currentTimetable) return null;
    
    return currentTimetable.timeSlots.find(slot => 
      slot.day === day && `${slot.startTime} - ${slot.endTime}` === time
    );
  };

  const exportToPDF = () => {
    if (currentTimetable) {
      exportTimetableToPDF(currentTimetable);
    }
  };

  const exportToExcel = () => {
    if (currentTimetable) {
      exportTimetableToExcel(currentTimetable);
    }
  };

  return (
    <div className={`p-4 md:p-6 space-y-4 md:space-y-6 transition-colors duration-200 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg shadow-sm p-4 md:p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Timetable Management</h1>
            <p className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Generate and manage optimized class schedules</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            >
              {[...Array(8)].map((_, i) => (
                <option key={i+1} value={i+1}>Semester {i+1}</option>
              ))}
            </select>
            
            <button
              onClick={generateTimetable}
              disabled={isGenerating || dataLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate New'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Data Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-lg shadow-sm p-4 md:p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <h2 className={`text-lg md:text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Data Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{classrooms.length}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Classrooms</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{subjects.length}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Subjects</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{faculty.length}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Faculty</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{batches.length}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Batches</div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-lg shadow-sm p-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
             <span className={`font-semibold ${
               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
             }`}>
                {currentTimetable ? currentTimetable.name : `No timetable for Semester ${selectedSemester}`}
             </span>
             {currentTimetable && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  currentTimetable.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {currentTimetable.status}
                </span>
             )}
          </div>
          
          {currentTimetable && (
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleDeleteTimetable(currentTimetable.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Timetable Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-lg shadow-sm overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {currentTimetable ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Time
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {timeSlots.slice(0, 6).map((time) => (
                  <tr key={time} className={`hover:${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {time}
                    </td>
                    {days.map((day) => {
                      const slot = getTimetableSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-6 py-4 align-top">
                          {slot ? (
                            <div className={`border rounded-lg p-3 min-h-[100px] text-xs ${
                              slot.is_break 
                                ? 'bg-orange-50 border-orange-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}>
                              {slot.is_break ? (
                                <div className="text-orange-900">
                                  <div className="font-bold mb-1 flex items-center">
                                    <Coffee className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                    {slot.break_name || 'Break'}
                                  </div>
                                  <div className="text-orange-700">
                                    <div className="flex items-center">
                                      <span className="text-xs">Recess Time</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="font-bold text-blue-900 mb-1">
                                    {slot.subject?.name || 'Unknown Subject'}
                                  </div>
                                  <div className="text-blue-700 space-y-1">
                                    <div className="flex items-center">
                                      <Users className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                      <span className="truncate">{slot.faculty?.name || 'Unknown Faculty'}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                      {slot.classroom?.name || 'Unknown Classroom'}
                                    </div>
                                    <div className="flex items-center">
                                      <BookOpen className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                      <span className="truncate">{slot.batch?.name || 'Unknown Batch'}</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="h-[100px]"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>No Timetable Found</h3>
            <p className={`text-sm md:text-base mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Click "Generate New" to create an optimized schedule for Semester {selectedSemester}
            </p>
            <button
              onClick={generateTimetable}
              disabled={isGenerating || dataLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>{isGenerating ? 'Generating...' : 'Generate New'}</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Generation Status */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className={`rounded-lg p-8 max-w-md mx-4 text-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Generating Timetable...</h3>
            <p className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Our optimization engine is creating a clash-free schedule. Please wait.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TimetableViewer;
