import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useTheme } from '../../context/themeContext';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $name: String
    $description: String
    $projectId: ID
    $assignedStudentId: ID
    $status: String
    $dueDate: String
  ) {
    updateTask(
      id: $id
      name: $name
      description: $description
      projectId: $projectId
      assignedStudentId: $assignedStudentId
      status: $status
      dueDate: $dueDate
    ) {
      _id
      name
      description
      status
      dueDate
      project {
        _id
        title
      }
      assignedStudent {
        _id
        name
      }
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const EditTaskModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  task, 
  projects = [], 
  students = [] 
}) => {
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    assignedStudent: '',
    status: '',
    dueDate: ''
  });
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [updateTask, { loading: updateLoading }] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);
  const { theme } = useTheme();

  useEffect(() => {
    if (task) {
      let dueDate = '';
      if (task.dueDate) {
        const parsedDate = new Date(Number(task.dueDate));
        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate.toISOString().split('T')[0];
        }
      }

      setFormData({
        projectId: task.project?._id || '',
        name: task.name || '',
        description: task.description || '',
        assignedStudent: task.assignedStudent?._id || '',
        status: task.status || 'Pending',
        dueDate: dueDate
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
          projectId: formData.projectId,
          assignedStudentId: formData.assignedStudent,
          status: formData.status,
          dueDate: formData.dueDate
        },
      });
      onSubmit?.(data.updateTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTask({ variables: { id: task._id } });
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  if (!visible || !task) return null;

  return (
    <>
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
            ×
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
              Status
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
              required
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

          <div className="flex justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={handleDeleteClick}
              className={`text-sm rounded px-4 py-2 transition flex-1 ${
                theme === 'dark' 
                  ? 'bg-red-600 hover:bg-red-800 text-white' 
                  : 'bg-red-500 hover:bg-red-700 text-white'
              }`}
            >
              Delete Task
            </button>

            <button
              type="submit"
              className={`text-sm rounded px-4 py-2 transition flex-1 ${
                theme === 'dark' 
                  ? 'bg-primary-dark hover:bg-blue-700 text-white' 
                  : 'bg-primary-light hover:bg-blue-600 text-white'
              }`}
              disabled={updateLoading}
            >
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <DeleteConfirmationModal
        visible={showDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        itemName={task.name}
        itemType="task"
      />
    </>
  );
};

export default EditTaskModal;