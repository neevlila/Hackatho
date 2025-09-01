import React, { useState } from 'react';
import { GraduationCap, Users, BookOpen, Building } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import { Batch } from '../types';
import DataManagement from './DataManagement';
import Modal from './Modal';
import BatchForm from './BatchForm';

const BatchManagement: React.FC = () => {
  const { batches, subjects, refreshData } = useSupabaseData();
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Batch Name',
      render: (batch: Batch) => (
        <div className="flex items-center">
          <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium">{batch.name}</span>
        </div>
      )
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (batch: Batch) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Semester {batch.semester}
        </span>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (batch: Batch) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-gray-400 mr-2" />
          <span>{batch.department}</span>
        </div>
      )
    },
    {
      key: 'strength',
      label: 'Student Count',
      render: (batch: Batch) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span>{batch.strength} students</span>
        </div>
      )
    },
    {
      key: 'subjects',
      label: 'Subjects',
      render: (batch: Batch) => (
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
          <span>{batch.subjects.length} subjects</span>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleDelete = async (batch: Batch) => {
    if (window.confirm(`Are you sure you want to delete ${batch.name}?`)) {
      try {
        const { error } = await supabase
          .from('batches')
          .delete()
          .eq('id', batch.id);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Error deleting batch. Please try again.');
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
        title="Batch Management"
        description="Manage student batches, their assignments, and subject enrollments"
        data={batches}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['name', 'department']}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingBatch ? 'Edit Batch' : 'Add New Batch'}
        size="lg"
      >
        <BatchForm
          batch={editingBatch || undefined}
          allSubjects={subjects}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
};

export default BatchManagement;
