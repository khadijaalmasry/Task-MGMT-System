import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useTheme } from '../../context/themeContext'; 

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      _id
      title
      students {
        _id
        name
      }
    }
  }
`;

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask(
    $name: String!
    $description: String!
    $projectId: ID!
    $assignedStudentId: ID
    $status: String!
    $dueDate: String!
  ) {
    createTask(
      name: $name
      description: $description
      projectId: $projectId
      assignedStudentId: $assignedStudentId
      status: $status
      dueDate: $dueDate
    ) {
      _id
      name
      status
    }
  }
`;

const CreateTaskModal = ({ visible, onClose, refetchTasks }) => {
  const { theme } = useTheme(); // Get current theme
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    assignedStudentId: '',
    status: 'Pending',
    dueDate: '',
  });

  // Fetch projects and students from GraphQL
  const { data: projectsData } = useQuery(GET_PROJECTS);
  const { data: studentsData } = useQuery(GET_STUDENTS);
  
  const [createTask] = useMutation(CREATE_TASK, {
    onCompleted: () => {
      refetchTasks();
      onClose();
    }
  });

  const [filteredStudents, setFilteredStudents] = useState([]);
  const projects = projectsData?.projects || [];
  const students = studentsData?.students || [];

  useEffect(() => {
    if (formData.projectId) {
      const selectedProject = projects.find(p => p._id === formData.projectId);
      if (selectedProject) {
        const allowedStudents = students.filter(s =>
          selectedProject.students.some(ps => ps._id === s._id)
        );
        setFilteredStudents(allowedStudents);
      }
    } else {
      setFilteredStudents(students);
    }
  }, [formData.projectId, projects, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedDueDate = new Date(formData.dueDate).toISOString().split('T')[0];
      await createTask({
        variables: {
          name: formData.name,
          description: formData.description,
          projectId: formData.projectId,
          assignedStudentId: formData.assignedStudentId || null,
          status: formData.status,
          dueDate: formattedDueDate
        }
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  if (!visible) return null;

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
          Create New Task
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
            placeholder="Task Name"
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
            placeholder="Task Description"
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
            name="assignedStudentId"
            value={formData.assignedStudentId}
            onChange={handleChange}
            className={`w-full p-2 text-sm rounded border ${
              theme === 'dark' 
                ? 'bg-[#313131] text-text-dark border-gray-600' 
                : 'bg-white text-text-light border-gray-300'
            }`}
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
            Task Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full p-2 text-sm rounded border ${
              theme === 'dark' 
                ? 'bg-[#313131] text-text-dark border-gray-600' 
                : 'bg-white text-text-light border-gray-300'
            }`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
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
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default CreateTaskModal;