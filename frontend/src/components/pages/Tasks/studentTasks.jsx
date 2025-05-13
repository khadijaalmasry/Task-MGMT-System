import { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Clock from "../../clock";
import StudentCreateTaskModal from "../../modals/studentAddTaskModal";
import { useTheme } from "../../../context/themeContext";
const statusOptions = ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"];

const GET_TASKS = gql`
  query GetTasks {
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
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $status: String) {
    updateTask(id: $id, status: $status) {
      _id
      status
    }
  }
`;

const formatTimeLeft = (dateValue) => {
  if (!dateValue) return "No due date";
  const timestamp = typeof dateValue === 'number' || /^\d+$/.test(dateValue)
    ? Number(dateValue)
    : dateValue;

  const now = new Date();
  const due = new Date(timestamp);
  if (isNaN(due.getTime())) return "Invalid date";

  const diffMs = due - now;
  if (diffMs <= 0) return "Past due";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

  return `${diffDays} day${diffDays !== 1 ? "s" : ""}, ${diffHours} hour${diffHours !== 1 ? "s" : ""}, and ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
};

const formatDueDate = (dateValue) => {
  if (!dateValue) return "—";
  try {
    if (typeof dateValue === 'number' || /^\d+$/.test(dateValue)) {
      return new Date(Number(dateValue)).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
      });
    }

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric"
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
};

const StudentTasks = ({ username }) => {
  const [sortBy, setSortBy] = useState("task-status");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
    const { theme } = useTheme();

  const { loading, error, data, refetch } = useQuery(GET_TASKS);
  const [updateTask] = useMutation(UPDATE_TASK);

  const tasks = data?.tasks?.filter(
    (task) => task.assignedStudent?.name === username
  ) || [];

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmStatus = async (taskId) => {
    try {
      await updateTask({ variables: { id: taskId, status: newStatus } });
      setEditingTaskId(null);
      setNewStatus("");
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "task-id") return a._id.localeCompare(b._id);
    if (sortBy === "task-status") return a.status.localeCompare(b.status);
    if (sortBy === "project") return a.project?.title?.localeCompare(b.project?.title || "") || 0;
    if (sortBy === "due-date") {
      const dateA = new Date(Number(a.dueDate));
      const dateB = new Date(Number(b.dueDate));
      return dateA - dateB;
    }
    return 0;
  });

  const upcomingTasks = tasks.filter(t => {
    const dueDate = t.dueDate ? new Date(Number(t.dueDate)) : null;
    return dueDate &&
      dueDate > currentTime &&
      t.status !== "Completed" &&
      t.status !== "Cancelled";
  });

  const nextTask = upcomingTasks.sort((a, b) => {
    const dateA = new Date(Number(a.dueDate));
    const dateB = new Date(Number(b.dueDate));
    return dateA - dateB;
  })[0];

  if (loading) return <div className={`p-4 ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Loading tasks...</div>;
  if (error) return <div className="text-red-400 p-4">Error loading tasks: {error.message}</div>;

  return (
    <div className={`h-[95vh] pl-[5%] pt-[2vh] overflow-y-auto ${
      theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'
    }`}>
      <div className="flex justify-between items-center w-[95%] mb-5">
        <div>
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'
          }`}>
            {nextTask
              ? `Next task: "${nextTask.name}" is due in ${formatTimeLeft(nextTask.dueDate)}`
              : "You don't have any upcoming tasks yet."}
          </h2>
          <Clock />
        </div>

        <div className="flex items-center gap-2.5">
          <label htmlFor="sort-task" className={`text-sm ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}>Sort by:</label>
          <select
            id="sort-task"
            className={`px-2 py-2 text-sm border rounded cursor-pointer ${
              theme === 'dark' 
                ? 'border-[#919191] bg-card-dark text-text-dark' 
                : 'border-gray-300 bg-card-light text-text-light'
            }`}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="task-id">task ID</option>
            <option value="task-status">task status</option>
            <option value="project">project</option>
            <option value="due-date">due date</option>
          </select>
          <button
            className={`text-sm rounded px-4 py-2 cursor-pointer transition hover:scale-105 ${
              theme === 'dark' 
                ? 'bg-primary-dark hover:bg-blue-700 text-white' 
                : 'bg-primary-light hover:bg-blue-600 text-white'
            }`}
            onClick={() => setIsModalOpen(true)}
          >
            create a new task
          </button>
        </div>
      </div>

      <table className={`w-[97%] mt-[3%] p-[2%] border-collapse shadow-md mb-8 ${
        theme === 'dark' 
          ? 'bg-card-dark shadow-black' 
          : 'bg-card-light shadow-gray-200'
      }`}>
        <thead>
          <tr>
            <th className={`p-2 border-b-2 ${
              theme === 'dark' 
                ? 'bg-[#484849] border-[#515151] text-text-dark' 
                : 'bg-gray-200 border-gray-300 text-text-light'
            }`}>Task ID</th>
            <th className={`p-2 border-b-2 ${
              theme === 'dark' 
                ? 'bg-[#484849] border-[#515151] text-text-dark' 
                : 'bg-gray-200 border-gray-300 text-text-light'
            }`}>Project</th>
            <th className={`p-2 border-b-2 ${
              theme === 'dark' 
                ? 'bg-[#484849] border-[#515151] text-text-dark' 
                : 'bg-gray-200 border-gray-300 text-text-light'
            }`}>Task Name</th>
            <th className={`p-2 border-b-2 ${
              theme === 'dark' 
                ? 'bg-[#484849] border-[#515151] text-text-dark' 
                : 'bg-gray-200 border-gray-300 text-text-light'
            }`}>Description</th>
            <th className={`p-2 border-b-2 ${
              theme === 'dark' 
                ? 'bg-[#484849] border-[#515151] text-text-dark' 
                : 'bg-gray-200 border-gray-300 text-text-light'
            }`}>Status</th>
            <th className={`p-2 border-b-2 ${
              theme === 'dark' 
                ? 'bg-[#484849] border-[#515151] text-text-dark' 
                : 'bg-gray-200 border-gray-300 text-text-light'
            }`}>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => (
            <tr
              key={task._id}
              className={`cursor-pointer ${
                theme === 'dark' 
                  ? 'hover:bg-[#3d3d3d]' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                if (editingTaskId !== task._id) {
                  setEditingTaskId(task._id);
                  setNewStatus(task.status);
                }
              }}
            >
              <td className={`p-2 border-b ${
                theme === 'dark' 
                  ? 'border-[#515151] text-text-dark' 
                  : 'border-gray-200 text-text-light'
              }`}>{task._id}</td>
              <td className={`p-2 border-b ${
                theme === 'dark' 
                  ? 'border-[#515151] text-text-dark' 
                  : 'border-gray-200 text-text-light'
              }`}>{task.project?.title || "—"}</td>
              <td className={`p-2 border-b ${
                theme === 'dark' 
                  ? 'border-[#515151] text-text-dark' 
                  : 'border-gray-200 text-text-light'
              }`}>{task.name}</td>
              <td className={`p-2 border-b ${
                theme === 'dark' 
                  ? 'border-[#515151] text-text-dark' 
                  : 'border-gray-200 text-text-light'
              }`}>{task.description}</td>
              <td className={`p-2 border-b ${
                theme === 'dark' 
                  ? 'border-[#515151] text-text-dark' 
                  : 'border-gray-200 text-text-light'
              }`}>
                {editingTaskId === task._id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className={`px-1 py-1 text-sm border rounded ${
                        theme === 'dark' 
                          ? 'border-[#919191] bg-[#3a3a3a] text-text-dark' 
                          : 'border-gray-300 bg-gray-100 text-text-light'
                      }`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmStatus(task._id);
                      }}
                      className={`text-xs px-2 py-1 rounded text-white ${
                        theme === 'dark' 
                          ? 'bg-[#555] hover:bg-[#666]' 
                          : 'bg-gray-500 hover:bg-gray-600'
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
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
                )}
              </td>
              <td className={`p-2 border-b ${
                theme === 'dark' 
                  ? 'border-[#515151] text-text-dark' 
                  : 'border-gray-200 text-text-light'
              }`}>
                {formatDueDate(task.dueDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <StudentCreateTaskModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refetchTasks={refetch}
      />
    </div>
  );
};

export default StudentTasks;