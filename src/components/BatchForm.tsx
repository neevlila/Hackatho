import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Batch, Subject } from '../types';

interface BatchFormProps {
  batch?: Batch;
  allSubjects: Subject[];
  onSave: () => void;
  onCancel: () => void;
}

const BatchForm: React.FC<BatchFormProps> = ({ batch, allSubjects, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    semester: '',
    department: '',
    strength: '',
    subjects: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        semester: batch.semester.toString(),
        department: batch.department,
        strength: batch.strength.toString(),
        subjects: batch.subjects
      });
    }
  }, [batch]);

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
        semester: parseInt(formData.semester),
        department: formData.department,
        strength: parseInt(formData.strength),
        subjects: formData.subjects
      };

      if (batch) {
        const { error } = await supabase
          .from('batches')
          .update(data)
          .eq('id', batch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('batches')
          .insert([data]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Error saving batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name *</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
          <input type="number" required min="1" max="8" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Strength *</label>
          <input type="number" required min="1" value={formData.strength} onChange={(e) => setFormData({ ...formData, strength: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Enrolled Subjects</label>
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
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : batch ? 'Update Batch' : 'Create Batch'}
        </button>
      </div>
    </form>
  );
};

export default BatchForm;
