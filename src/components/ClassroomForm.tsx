import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Classroom } from '../types';

interface ClassroomFormProps {
  classroom?: Classroom;
  onSave: () => void;
  onCancel: () => void;
}

const ClassroomForm: React.FC<ClassroomFormProps> = ({ classroom, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    type: 'lecture' as 'lecture' | 'lab' | 'seminar',
    equipment: [] as string[],
    building: '',
    floor: ''
  });
  const [loading, setLoading] = useState(false);
  const [newEquipment, setNewEquipment] = useState('');

  const equipmentOptions = [
    'Projector', 'Whiteboard', 'Computer', 'Audio System', 
    'Air Conditioning', 'Microphone', 'Smart Board', 'WiFi'
  ];

  useEffect(() => {
    if (classroom) {
      setFormData({
        name: classroom.name,
        capacity: classroom.capacity.toString(),
        type: classroom.type,
        equipment: classroom.equipment,
        building: classroom.building,
        floor: classroom.floor.toString()
      });
    }
  }, [classroom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        capacity: parseInt(formData.capacity),
        type: formData.type,
        equipment: formData.equipment,
        building: formData.building,
        floor: parseInt(formData.floor)
      };

      if (classroom) {
        const { error } = await supabase
          .from('classrooms')
          .update(data)
          .eq('id', classroom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('classrooms')
          .insert([data]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving classroom:', error);
      alert('Error saving classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = (equipment: string) => {
    if (!formData.equipment.includes(equipment)) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, equipment]
      });
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter(e => e !== equipment)
    });
  };

  const addCustomEquipment = () => {
    if (newEquipment.trim() && !formData.equipment.includes(newEquipment.trim())) {
      addEquipment(newEquipment.trim());
      setNewEquipment('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., A-101"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="lecture">Lecture Hall</option>
            <option value="lab">Laboratory</option>
            <option value="seminar">Seminar Room</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Building *
          </label>
          <input
            type="text"
            required
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="A Block"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Floor *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Equipment
        </label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((equipment) => (
              <button
                key={equipment}
                type="button"
                onClick={() => addEquipment(equipment)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  formData.equipment.includes(equipment)
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {equipment}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              placeholder="Add custom equipment"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addCustomEquipment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {formData.equipment.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.equipment.map((equipment) => (
                <span
                  key={equipment}
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {equipment}
                  <button
                    type="button"
                    onClick={() => removeEquipment(equipment)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : classroom ? 'Update Classroom' : 'Create Classroom'}
        </button>
      </div>
    </form>
  );
};

export default ClassroomForm;
