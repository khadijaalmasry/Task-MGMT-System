import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useTheme } from '../../context/themeContext';
// import {GET_STUDENTS, CREATE_PROJECT} from '../../queries.js';
// Queries
const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
      isAdmin
    }
  }
`;

// Mutation
const CREATE_PROJECT = gql`
  mutation CreateProject(
    $title: String!
    $description: String
    $category: String
    $studentIds: [ID!]
    $startDate: String!
    $endDate: String!
  ) {
    createProject(
      title: $title
      description: $description
      category: $category
      studentIds: $studentIds
      startDate: $startDate
      endDate: $endDate
    ) {
      _id
      title
      description
      category
      students {
        _id
        name
      }
      startDate
      endDate
      status
    }
  }
`;

const AddProjectModal = ({ visible, onClose, categories = [], refetchProjects }) => {
  const { theme } = useTheme();
  const { data, loading, error } = useQuery(GET_STUDENTS);
  const [createProject] = useMutation(CREATE_PROJECT);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedStudents: [],
    category: categories[0] || '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;

    if (type === 'select-multiple') {
      const selected = Array.from(selectedOptions, (option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: selected }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        variables: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          studentIds: formData.selectedStudents,
          startDate: formData.startDate,
          endDate: formData.endDate,
        },
      });

      setFormData({
        title: '',
        description: '',
        selectedStudents: [],
        category: categories[0] || '',
        startDate: '',
        endDate: '',
      });

      await refetchProjects?.();
      onClose();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

   if (!visible) return null;
  if (loading) return <div className={`p-4 ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Loading students...</div>;
  if (error) return <div className="text-red-500 p-4">Failed to load students.</div>;

  const nonAdminStudents = data?.students?.filter((s) => !s.isAdmin) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleSubmit}
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
          Add New Project
        </h1>

        {/* Project Title */}
        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Project Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter project title"
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        />

        {/* Description */}
        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
          rows={3}
          className={`w-full rounded-md border p-2 text-sm min-h-[5vh] resize-none ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        />

        {/* Students */}
        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Assign Students
        </label>
        <select
          name="selectedStudents"
          multiple
          value={formData.selectedStudents}
          onChange={handleChange}
          className={`w-full min-h-[100px] rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        >
          {nonAdminStudents.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name}
            </option>
          ))}
        </select>

        {/* Category */}
        <label className={`text-sm font-semibold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className={`w-full rounded-md border p-2 text-sm ${
            theme === 'dark' 
              ? 'border-gray-600 bg-[#313131] text-text-dark' 
              : 'border-gray-300 bg-white text-text-light'
          }`}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Start Date */}
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

        {/* End Date */}
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

        <button
          type="submit"
          className={`mt-4 rounded-md px-4 py-2 text-sm font-medium transition-transform transform hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-primary-dark text-white hover:bg-blue-700' 
              : 'bg-primary-light text-white hover:bg-blue-600'
          }`}
        >
          Create Project
        </button>
      </form>
    </div>
  );
};

export default AddProjectModal;