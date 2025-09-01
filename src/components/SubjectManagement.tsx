import React, { useState } from 'react';
import { BookOpen, Code, Award } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import { Subject } from '../types';
import DataManagement from './DataManagement';
import Modal from './Modal';
import SubjectForm from './SubjectForm';

const SubjectManagement: React.FC = () => {
  const { subjects, refreshData } = useSupabaseData();
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Subject Name',
      render: (subject: Subject) => (
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium">{subject.name}</span>
        </div>
      )
    },
    {
      key: 'code',
      label: 'Subject Code',
      render: (subject: Subject) => (
        <div className="flex items-center">
          <Code className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-mono text-sm">{subject.code}</span>
        </div>
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      render: (subject: Subject) => (
        <div className="flex items-center">
          <Award className="h-4 w-4 text-gray-400 mr-2" />
          <span>{subject.credits}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (subject: Subject) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          subject.type === 'core' ? 'bg-red-100 text-red-800' :
          subject.type === 'elective' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {subject.type}
        </span>
      )
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (subject: Subject) => (
        <span className="text-sm">Semester {subject.semester}</span>
      )
    },
    {
      key: 'department',
      label: 'Department'
    }
  ];

  const handleAdd = () => {
    setEditingSubject(null);
    setShowModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleDelete = async (subject: Subject) => {
    if (window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
      try {
        const { error } = await supabase
          .from('subjects')
          .delete()
          .eq('id', subject.id);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Error deleting subject. Please try again.');
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
        title="Subject Management"
        description="Manage subjects, codes, credits, and semester assignments"
        data={subjects}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={['name', 'code', 'department']}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <SubjectForm
          subject={editingSubject || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
};

export default SubjectManagement;
