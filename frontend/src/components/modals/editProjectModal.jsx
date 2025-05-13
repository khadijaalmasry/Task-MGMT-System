import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useTheme } from '../../context/themeContext';

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
      isAdmin
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID!
    $title: String
    $description: String
    $category: String
    $studentIds: [ID!]
    $startDate: String
    $endDate: String
    $status: String
  ) {
    updateProject(
      id: $id
      title: $title
      description: $description
      category: $category
      studentIds: $studentIds
      startDate: $startDate
      endDate: $endDate
      status: $status
    ) {
      _id
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

const EditProjectModal = ({
  visible,
  onClose,
  project,
  categories = [],
  refetchProjects
}) => {
  const { data, loading, error } = useQuery(GET_STUDENTS);
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedStudents: [],
    category: '',
    startDate: '',
    endDate: '',
    status: 'In Progress'
  });

  const [updateProject] = useMutation(UPDATE_PROJECT, {
    onCompleted: () => {
      refetchProjects();
      onClose();
    }
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      refetchProjects();
      onClose();
    }
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        selectedStudents: project.students?.map(s => s._id) || [],
        category: project.category || categories[0] || '',
        startDate: project.startDate?.split('T')[0] || '',
        endDate: project.endDate?.split('T')[0] || '',
        status: project.status || 'In Progress'
      });
    }
  }, [project, categories]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const selected = Array.from(selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProject({
        variables: {
          id: project._id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          studentIds: formData.selectedStudents,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status
        }
      });
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
    if (confirmed) {
      try {
        await deleteProject({ variables: { id: project._id } });
      } catch (err) {
        console.error("Error deleting project:", err);
      }
    }
  };
  if (!visible || !project) return null;
  if (loading) return <div className={`p-4 ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Loading students...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading students.</div>;

  const nonAdminStudents = data?.students?.filter(s => !s.isAdmin) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleUpdate}
        className={`relative w-full max-w-md max-h-[85%] overflow-y-auto rounded-lg p-6 shadow-lg flex flex-col gap-4 ${
          theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-3 right-4 text-2xl hover:text-gray-300 ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}
        >
          &times;
        </button>

        <h1 className={`text-xl font-semibold text-center ${
          theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'
        }`}>
          Edit Project
        </h1>

        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Project Title
        </label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        />

        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Project Description
        </label>
        <input
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        />

        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Students
        </label>
        <select
          name="selectedStudents"
          multiple
          value={formData.selectedStudents}
          onChange={handleChange}
          className={`w-full min-h-24 overflow-y-auto rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        >
          {nonAdminStudents.length === 0 ? (
            <option disabled>No eligible students</option>
          ) : (
            nonAdminStudents.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))
          )}
        </select>

        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
          required
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Start Date
        </label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        />

        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          End Date
        </label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
          min={formData.startDate}
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        />

        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="On hold">On Hold</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <div className="flex justify-between gap-4 mt-4">
          <button
            type="submit"
            className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-transform transform hover:scale-105 ${
              theme === 'dark' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-transform transform hover:scale-105 ${
              theme === 'dark' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProjectModal;