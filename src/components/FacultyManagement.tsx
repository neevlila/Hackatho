import React, { useState } from 'react';
import { Users, Mail, Clock } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import { Faculty } from '../types';
import DataManagement from './DataManagement';
import Modal from './Modal';
import FacultyForm from './FacultyForm';

const FacultyManagement: React.FC = () => {
  const { faculty, subjects, refreshData } = useSupabaseData();
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Faculty Name',
      render: (item: Faculty) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {item.name.charAt(0)}
            </span>
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (item: Faculty) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{item.email}</span>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department'
    },
    {
      key: 'subjects',
      label: 'Subjects',
      render: (item: Faculty) => (
        <span className="text-sm">
          {item.subjects.length} subject{item.subjects.length !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      key: 'maxHoursPerWeek',
      label: 'Max Hours/Week',
      render: (item: Faculty) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          <span>{item.maxHoursPerWeek}h</span>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    setEditingFaculty(null);
    setShowModal(true);
  };

  const handleEdit = (item: Faculty) => {
    setEditingFaculty(item);
    setShowModal(true);
  };

  const handleDelete = async (item: Faculty) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        const { error } = await supabase
          .from('faculty')
          .delete()
          .eq('id', item.id);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error deleting faculty:', error);
        alert('Error deleting faculty. Please try again.');
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
        title="Faculty Management"
        description="Manage faculty members, their availability, and subject assignments"
        data={faculty}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['name', 'email', 'department']}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        size="lg"
      >
        <FacultyForm
          faculty={editingFaculty || undefined}
          allSubjects={subjects}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
};

export default FacultyManagement;
