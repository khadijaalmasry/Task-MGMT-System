import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useTheme } from '../../context/themeContext'; 

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $name: String
    $description: String
    $projectId: ID
    $assignedStudentId: ID
    $dueDate: String
  ) {
    updateTask(
      id: $id
      name: $name
      description: $description
      projectId: $projectId
      assignedStudentId: $assignedStudentId
      dueDate: $dueDate
    ) {
      _id
      name
      description
      dueDate
      assignedStudent {
        _id
        name
      }
      project {
        _id
        title
      }
    }
  }
`;

const EditTaskModal = ({ visible, onClose, onSubmit, task, projects = [], students = [] }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    assignedStudent: '',
    dueDate: '',
  });

  const [filteredStudents, setFilteredStudents] = useState(students);
  const [updateTask, { loading, error }] = useMutation(UPDATE_TASK);
  const { theme } = useTheme(); 

  useEffect(() => {
    if (task) {
      let dueDate = '';
      if (task.dueDate) {
        const parsedDate = new Date(task.dueDate);
        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate.toISOString().split('T')[0];
        }
      }

      setFormData({
        projectId: task.project?._id || '',
        name: task.name || '',
        description: task.description || '',
        assignedStudent: task.assignedStudent?._id || '',
        dueDate,
      });
    }
  }, [task]);

  useEffect(() => {
    if (formData.projectId) {
      const selectedProject = projects.find(p => p._id === formData.projectId);
      if (selectedProject) {
        const allowedStudents = students.filter(s =>
          selectedProject.students?.some(ps => ps._id === s._id)
        );
        setFilteredStudents(allowedStudents);
      }
    } else {
      setFilteredStudents(students);
    }
  }, [formData.projectId, projects, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateTask({
        variables: {
          id: task._id,
          name: formData.name,
          description: formData.description,
          dueDate: formData.dueDate,
          assignedStudentId: formData.assignedStudent,
          projectId: formData.projectId,
        },
      });
      onSubmit?.(data.updateTask);
      onClose();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

   if (!visible || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded-lg w-[450px] max-w-full max-h-[85%] overflow-y-auto shadow-lg flex flex-col gap-4 relative ${
          theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-2 right-3 text-2xl cursor-pointer ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}
        >
          &times;
        </button>

        <h1 className={`text-2xl font-bold text-center ${
          theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'
        }`}>
          Edit Task
        </h1>

        <div>
          <label className={`block text-sm font-bold mb-1 ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}>
            Select Project
          </label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className={`w-full p-2 text-sm rounded border ${
              theme === 'dark' 
                ? 'bg-[#313131] text-text-dark border-gray-600' 
                : 'bg-white text-text-light border-gray-300'
            }`}
            required
          >
            <option value="">-- Select Project --</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}>
            Task Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 text-sm rounded border ${
              theme === 'dark' 
                ? 'bg-[#313131] text-text-dark border-gray-600' 
                : 'bg-white text-text-light border-gray-300'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full p-2 text-sm rounded border min-h-[80px] resize-y ${
              theme === 'dark' 
                ? 'bg-[#313131] text-text-dark border-gray-600' 
                : 'bg-white text-text-light border-gray-300'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}>
            Assigned Student
          </label>
          <select
            name="assignedStudent"
            value={formData.assignedStudent}
            onChange={handleChange}
            className={`w-full p-2 text-sm rounded border ${
              theme === 'dark' 
                ? 'bg-[#313131] text-text-dark border-gray-600' 
                : 'bg-white text-text-light border-gray-300'
            }`}
            required
          >
            <option value="">-- Select Student --</option>
            {filteredStudents.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}>
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`w-full p-2 text-sm rounded border ${
              theme === 'dark' 
                ? 'bg-[#313131] text-text-dark border-gray-600' 
                : 'bg-white text-text-light border-gray-300'
            }`}
            required
          />
        </div>

        <button
          type="submit"
          className={`text-sm rounded px-4 py-2 mt-4 transition ${
            theme === 'dark' 
              ? 'bg-primary-dark hover:bg-blue-700 text-white' 
              : 'bg-primary-light hover:bg-blue-600 text-white'
          }`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {error && (
          <p className="text-red-400 text-sm mt-2">Error: {error.message}</p>
        )}
      </form>
    </div>
  );
};

export default EditTaskModal;