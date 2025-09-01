import React, { useState } from 'react';
import { MapPin, Users, Monitor, Thermometer } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import { Classroom } from '../types';
import DataManagement from './DataManagement';
import Modal from './Modal';
import ClassroomForm from './ClassroomForm';

const ClassroomManagement: React.FC = () => {
  const { classrooms, refreshData } = useSupabaseData();
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Room Name',
      render: (classroom: Classroom) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium">{classroom.name}</span>
        </div>
      )
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (classroom: Classroom) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span>{classroom.capacity} students</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (classroom: Classroom) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          classroom.type === 'lecture' ? 'bg-blue-100 text-blue-800' :
          classroom.type === 'lab' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {classroom.type}
        </span>
      )
    },
    {
      key: 'building',
      label: 'Location',
      render: (classroom: Classroom) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{classroom.building}</div>
          <div className="text-sm text-gray-500">Floor {classroom.floor}</div>
        </div>
      )
    },
    {
      key: 'equipment',
      label: 'Equipment',
      render: (classroom: Classroom) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900">
            {classroom.equipment.slice(0, 2).join(', ')}
            {classroom.equipment.length > 2 && (
              <span className="text-gray-500"> +{classroom.equipment.length - 2} more</span>
            )}
          </div>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    setEditingClassroom(null);
    setShowModal(true);
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setShowModal(true);
  };

  const handleDelete = async (classroom: Classroom) => {
    if (window.confirm(`Are you sure you want to delete ${classroom.name}?`)) {
      try {
        const { error } = await supabase
          .from('classrooms')
          .delete()
          .eq('id', classroom.id);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error deleting classroom:', error);
        alert('Error deleting classroom. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    await refreshData();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <DataManagement
        title="Classroom Management"
        description="Manage classrooms, equipment, and capacity information"
        data={classrooms}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['name', 'building', 'type']}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}
        size="lg"
      >
        <ClassroomForm
          classroom={editingClassroom || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
};

export default ClassroomManagement;
