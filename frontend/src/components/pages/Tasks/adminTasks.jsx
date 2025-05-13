import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import CreateTaskModal from "../../modals/addTaskModal.jsx";
import EditTaskModal from "../../modals/editTaskModal.jsx";
import { useTheme } from "../../../context/themeContext.jsx";

const GET_ALL_DATA = gql`
  query {
  tasks {
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
  projects {
    _id
    title
    students {
      _id
      name
    }
  }
  students {
    _id
    name
  }
}
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const TasksPage = () => {
    const { theme } = useTheme(); // Get current theme
    const { data, loading, error, refetch } = useQuery(GET_ALL_DATA);
    const [deleteTaskMutation] = useMutation(DELETE_TASK);
    const [sortBy, setSortBy] = useState("task-status");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const tableRef = useRef(null);

    const tasks = data?.tasks || [];
    const projects = data?.projects || [];
    const students = data?.students || [];

    const formatDueDate = (dateValue) => {
        if (!dateValue) return "—";
        
        try {
          if (typeof dateValue === 'number' || /^\d+$/.test(dateValue)) {
            return new Date(Number(dateValue)).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric"
            });
          }
          
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) {
            console.warn("Invalid date value:", dateValue);
            return "Invalid Date";
          }
          return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
        } catch (e) {
          console.error("Error formatting date:", e);
          return "Invalid Date";
        }
    };

    const handleDeleteTask = async (taskId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) {
            setSelectedTask(null);
            return;
        }

        try {
            await deleteTaskMutation({ variables: { id: taskId } });
            await refetch();
            setSelectedTask(null);
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortBy === "task-id") return a._id.localeCompare(b._id);
        if (sortBy === "task-status") return a.status.localeCompare(b.status);
        if (sortBy === "project") return a.project?.title?.localeCompare(b.project?.title);
        if (sortBy === "due-date") {
            const dateA = new Date(Number(a.dueDate));
            const dateB = new Date(Number(b.dueDate));
            return dateA - dateB;
        }
        if (sortBy === "assigned-student") return a.assignedStudent?.name?.localeCompare(b.assignedStudent?.name);
        return 0;
    });

    if (loading) return <div className={`p-10 ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Loading tasks...</div>;
    if (error) return <div className="text-red-400 p-10">Error: {error.message}</div>;

    return (
        <div className={`text-sm h-[95vh] pl-[5%] pt-[2vh] overflow-y-auto pb-8 ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
            <div className="flex justify-between items-center w-[95%] mb-5">
                <div className="flex items-center gap-2.5">
                    <label htmlFor="sort-task" className={`text-sm ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Sort by:</label>
                    <select
                        id="sort-task"
                        className={`px-2 py-2 text-sm border rounded cursor-pointer
                            ${theme === 'dark' 
                                ? 'border-[#919191] bg-card-dark text-text-dark' 
                                : 'border-gray-300 bg-card-light text-text-light'}`}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="task-id">task ID</option>
                        <option value="task-status">task status</option>
                        <option value="project">project</option>
                        <option value="due-date">due date</option>
                        <option value="assigned-student">assigned student</option>
                    </select>
                </div>

                <button
                    className={`text-sm rounded px-4 py-2 cursor-pointer transition hover:scale-105
                        ${theme === 'dark' 
                            ? 'bg-primary-dark text-white hover:bg-blue-700' 
                            : 'bg-primary-light text-white hover:bg-blue-600'}`}
                    onClick={() => setShowCreateModal(true)}
                >
                    create a new task
                </button>
            </div>

             <table
                ref={tableRef}
                className={`w-[97%] mt-[3%] p-[2%] border-collapse shadow-md mb-8
                    ${theme === 'dark' 
                        ? 'bg-card-dark shadow-black text-text-dark' 
                        : 'bg-card-light shadow-gray-200 text-text-light'}`}
            >
                <thead>
                    <tr>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}>Task ID</th>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}>Project</th>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}>Task Name</th>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}>Description</th>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}>Assigned Student</th>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}>Status</th>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}>Due Date</th>
                        <th className={`p-2 border-b-2 ${theme === 'dark' ? 'bg-[#484849] border-[#515151] text-text-dark' : 'bg-gray-200 border-gray-300 text-text-light'}`}></th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTasks.map((task) => (
                        <tr
                            key={task._id}
                            className={`cursor-pointer transition-colors duration-150 
                                ${selectedTask?._id === task._id 
                                    ? (theme === 'dark' 
                                        ? "bg-[#4a4a4a] border-2 border-blue-500" 
                                        : "bg-gray-100 border-2 border-blue-400")
                                    : (theme === 'dark' 
                                        ? "hover:bg-[#3d3d3d]" 
                                        : "hover:bg-gray-50")}`}
                            onClick={() => setSelectedTask(task)}
                        >
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>{task._id}</td>
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>{task.project?.title || "—"}</td>
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>{task.name}</td>
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>{task.description}</td>
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>{task.assignedStudent?.name || "—"}</td>
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>
                                <span
                                    className={
                                        task.status === "Pending"
                                            ? "text-orange-400"
                                            : task.status === "In Progress"
                                                ? "text-green-400"
                                                : task.status === "Completed"
                                                    ? "text-blue-400"
                                                    : task.status === "On Hold"
                                                        ? "text-purple-400"
                                                        : task.status === "Cancelled"
                                                            ? "text-red-400"
                                                            : ""
                                    }
                                >
                                    {task.status}
                                </span>
                            </td>
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>
                                {formatDueDate(task.dueDate)}
                            </td>
                            <td className={`p-2 border-b ${theme === 'dark' ? 'border-[#515151] text-text-dark' : 'border-gray-200 text-text-light'}`}>
                                {selectedTask?._id === task._id && (
                                    <div className="flex gap-2">
                                        <button
                                            className={`text-xs px-2 py-1 rounded hover:scale-105 transition
                                                ${theme === 'dark' 
                                                    ? 'bg-blue-600 hover:bg-blue-800 text-white' 
                                                    : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={`text-xs px-2 py-1 rounded hover:scale-105 transition
                                                ${theme === 'dark' 
                                                    ? 'bg-red-600 hover:bg-red-800 text-white' 
                                                    : 'bg-red-500 hover:bg-red-700 text-white'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(task._id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showCreateModal && (
                <CreateTaskModal
                    visible={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    refetchTasks={refetch}
                />
            )}

            <EditTaskModal
                visible={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
                onSubmit={() => {
                    refetch();
                    setShowEditModal(false);
                }}
                projects={projects}
                students={students}
            />
        </div>
    );
};

export default TasksPage;