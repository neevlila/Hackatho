import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  GraduationCap, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const { classrooms, subjects, faculty, batches, timetables, loading } = useSupabaseData();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const stats = [
    {
      name: 'Total Classrooms',
      value: classrooms.length,
      icon: MapPin,
      color: 'bg-blue-500',
      change: '+12%',
      path: '/classrooms'
    },
    {
      name: 'Faculty Members',
      value: faculty.length,
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
      path: '/faculty'
    },
    {
      name: 'Subjects',
      value: subjects.length,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+8%',
      path: '/subjects'
    },
    {
      name: 'Student Batches',
      value: batches.length,
      icon: GraduationCap,
      color: 'bg-orange-500',
      change: '+3%',
      path: '/batches'
    }
  ];

  const recentActivity = [
    { action: 'Generated timetable for Semester 5', time: '2 hours ago', status: 'success' },
    { action: 'Added new classroom A-101', time: '4 hours ago', status: 'success' },
    { action: 'Faculty availability updated', time: '6 hours ago', status: 'warning' },
    { action: 'Semester 3 schedule conflict resolved', time: '1 day ago', status: 'success' }
  ];

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className={`p-4 md:p-6 flex items-center justify-center min-h-screen ${
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
        <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Dashboard</h1>
        <p className={`text-sm md:text-base ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>Welcome to your timetable management system</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleQuickAction(stat.path)}
              className={`rounded-lg shadow-sm p-4 md:p-6 cursor-pointer hover:shadow-md transition-all ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-2 md:p-3 rounded-lg`}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="ml-3 md:ml-4 flex-1">
                  <p className={`text-xs md:text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{stat.name}</p>
                  <div className="flex items-center">
                    <p className={`text-xl md:text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{stat.value}</p>
                    <span className="ml-2 text-xs md:text-sm text-green-600 font-medium">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-lg shadow-sm p-4 md:p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2 className={`text-lg md:text-xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => handleQuickAction('/timetables')}
              className={`w-full flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-blue-100 transition-colors ${
                theme === 'dark' ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2 md:mr-3" />
                <span className={`font-medium text-xs md:text-sm ${
                  theme === 'dark' ? 'text-blue-200' : 'text-gray-900'
                }`}>Generate New Timetable</span>
              </div>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </button>
            <button 
              onClick={() => handleQuickAction('/faculty')}
              className={`w-full flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-green-100 transition-colors ${
                theme === 'dark' ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-green-50 hover:bg-green-100'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-2 md:mr-3" />
                <span className={`font-medium text-xs md:text-sm ${
                  theme === 'dark' ? 'text-green-200' : 'text-gray-900'
                }`}>Add Faculty Member</span>
              </div>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </button>
            <button 
              onClick={() => handleQuickAction('/classrooms')}
              className={`w-full flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-purple-100 transition-colors ${
                theme === 'dark' ? 'bg-purple-900/20 hover:bg-purple-900/30' : 'bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2 md:mr-3" />
                <span className={`font-medium text-xs md:text-sm ${
                  theme === 'dark' ? 'text-purple-200' : 'text-gray-900'
                }`}>Manage Classrooms</span>
              </div>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-lg shadow-sm p-4 md:p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2 className={`text-lg md:text-xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Recent Activity</h2>
          <div className="space-y-3 md:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-2 md:space-x-3">
                <div className="flex-shrink-0">
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs md:text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{activity.action}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-400 mr-1" />
                    <p className={`text-xs md:text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm p-4 md:p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-2">System Status</h2>
            <p className="text-blue-100 text-sm md:text-base">All systems operational. Ready to generate optimized timetables.</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Online</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
