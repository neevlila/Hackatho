import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Subject } from '../types';

interface SubjectFormProps {
  subject?: Subject;
  onSave: () => void;
  onCancel: () => void;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: '',
    type: 'core' as 'core' | 'elective' | 'lab',
    semester: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        credits: subject.credits.toString(),
        type: subject.type,
        semester: subject.semester.toString(),
        department: subject.department
      });
    }
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        code: formData.code,
        credits: parseInt(formData.credits),
        type: formData.type,
        semester: parseInt(formData.semester),
        department: formData.department
      };

      if (subject) {
        const { error } = await supabase
          .from('subjects')
          .update(data)
          .eq('id', subject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([data]);
        if (error) throw error;
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      alert(`Error saving subject: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Advanced Algorithms"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code *</label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., CS501"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Credits *</label>
          <input
            type="number"
            required
            min="1"
            max="10"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="1-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Type *</label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="core">Core</option>
            <option value="elective">Elective</option>
            <option value="lab">Lab</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
          <input
            type="number"
            required
            min="1"
            max="8"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <input
            type="text"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Computer Science"
          />
        </div>
      </div>
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : subject ? 'Update Subject' : 'Create Subject'}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
