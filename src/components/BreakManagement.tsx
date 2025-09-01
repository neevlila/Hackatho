import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Trash2, Coffee } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Break {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days: string[];
  user_id: string;
}

const BreakManagement: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBreak, setNewBreak] = useState({
    name: '',
    start_time: '12:00',
    end_time: '13:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchBreaks();
  }, []);

  const fetchBreaks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('breaks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time');
      
      if (error) throw error;
      setBreaks(data || []);
    } catch (error) {
      console.error('Error fetching breaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBreak = async () => {
    if (!user || !newBreak.name.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('breaks')
        .insert([{
          ...newBreak,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setBreaks([...breaks, data]);
      setNewBreak({
        name: '',
        start_time: '12:00',
        end_time: '13:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding break:', error);
      alert('Failed to add break. Please try again.');
    }
  };

  const deleteBreak = async (breakId: string) => {
    if (!window.confirm('Are you sure you want to delete this break?')) return;
    
    try {
      const { error } = await supabase
        .from('breaks')
        .delete()
        .eq('id', breakId);
      
      if (error) throw error;
      
      setBreaks(breaks.filter(b => b.id !== breakId));
    } catch (error) {
      console.error('Error deleting break:', error);
      alert('Failed to delete break. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    setNewBreak(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  if (loading) {
    return (
      <div className={`p-6 flex items-center justify-center min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            }`}>Break Management</h1>
            <p className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Configure break and recess times for your timetables</p>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Break</span>
          </button>
        </div>
      </motion.div>

      {/* Add Break Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg shadow-sm p-4 md:p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2 className={`text-lg md:text-xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Add New Break</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Break Name</label>
              <input
                type="text"
                value={newBreak.name}
                onChange={(e) => setNewBreak({ ...newBreak, name: e.target.value })}
                placeholder="e.g., Lunch Break"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Start Time</label>
              <input
                type="time"
                value={newBreak.start_time}
                onChange={(e) => setNewBreak({ ...newBreak, start_time: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>End Time</label>
              <input
                type="time"
                value={newBreak.end_time}
                onChange={(e) => setNewBreak({ ...newBreak, end_time: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Duration</label>
              <div className={`px-3 py-2 border rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-300'
                  : 'bg-gray-50 border-gray-300 text-gray-600'
              }`}>
                {(() => {
                  const start = new Date(`2000-01-01T${newBreak.start_time}`);
                  const end = new Date(`2000-01-01T${newBreak.end_time}`);
                  const diff = end.getTime() - start.getTime();
                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  return `${hours}h ${minutes}m`;
                })()}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Days of Week</label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newBreak.days.includes(day)
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={addBreak}
              disabled={!newBreak.name.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Add Break
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Breaks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-lg shadow-sm overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {breaks.length === 0 ? (
          <div className="p-12 text-center">
            <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>No Breaks Configured</h3>
            <p className={`text-sm md:text-base mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Add breaks to ensure students and faculty have proper rest periods
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add First Break</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Break Name</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Time</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Days</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Duration</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {breaks.map((breakItem) => (
                  <tr key={breakItem.id} className={`hover:${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {breakItem.name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{breakItem.start_time} - {breakItem.end_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-1">
                        {breakItem.days.map((day) => (
                          <span
                            key={day}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              theme === 'dark'
                                ? 'bg-blue-900 text-blue-200'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {(() => {
                        const start = new Date(`2000-01-01T${breakItem.start_time}`);
                        const end = new Date(`2000-01-01T${breakItem.end_time}`);
                        const diff = end.getTime() - start.getTime();
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        return `${hours}h ${minutes}m`;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteBreak(breakItem.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BreakManagement;
