import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Faculty, Subject } from '../types';

interface FacultyFormProps {
  faculty?: Faculty;
  allSubjects: Subject[];
  onSave: () => void;
  onCancel: () => void;
}

const FacultyForm: React.FC<FacultyFormProps> = ({ faculty, allSubjects, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    subjects: [] as string[],
    availability: JSON.stringify({
      "Monday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      "Tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      "Wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      "Thursday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      "Friday": ["09:00", "10:00", "11:00", "14:00", "15:00"]
    }, null, 2),
    max_hours_per_week: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        subjects: faculty.subjects,
        availability: JSON.stringify(faculty.availability, null, 2),
        max_hours_per_week: faculty.maxHoursPerWeek.toString()
      });
    }
  }, [faculty]);

  const handleSubjectChange = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        subjects: formData.subjects,
        availability: JSON.parse(formData.availability),
        max_hours_per_week: parseInt(formData.max_hours_per_week)
      };

      if (faculty) {
        const { error } = await supabase
          .from('faculty')
          .update(data)
          .eq('id', faculty.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faculty')
          .insert([data]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving faculty:', error);
      alert('Error saving faculty. Check if availability JSON is valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Hours/Week *</label>
          <input type="number" required min="1" value={formData.max_hours_per_week} onChange={(e) => setFormData({ ...formData, max_hours_per_week: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Teachable Subjects</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
          {allSubjects.map(subject => (
            <label key={subject.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.subjects.includes(subject.id)}
                onChange={() => handleSubjectChange(subject.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{subject.name} ({subject.code})</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Availability (JSON format)</label>
        <textarea
          rows={8}
          value={formData.availability}
          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : faculty ? 'Update Faculty' : 'Create Faculty'}
        </button>
      </div>
    </form>
  );
};

export default FacultyForm;
