//import React from 'react';
import AdminTasks from './Tasks/adminTasks';
import StudentTasks from './Tasks/studentTasks';

const Tasks = ({ isAdmin, onAddTask, username }) => {
  return isAdmin ? (
    <AdminTasks onAddTask={onAddTask} />
  ) : (
    <StudentTasks username={username} />
  );
};


export default Tasks;
