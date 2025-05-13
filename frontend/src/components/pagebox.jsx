import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './pages/home';
import Projects from './pages/projects';
import Tasks from './pages/tasks';
import Chat from './pages/chat';
import Students from './pages/students';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/themeContext'; // Import theme hook

const PageBox = ({ currentPage, onOpenProjectForm, onOpenTaskForm }) => {
  const { theme } = useTheme(); // Get current theme
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin || false;
  const username = user?.name || '';
  
  // Define page access rules based on user role
  const pageAccess = {
    home: isAdmin,       // Only admins can access home
    projects: isAdmin,   // Only admins can access projects
    tasks: true,         // All authenticated users can access tasks
    chat: true,           // All authenticated users can access chat
    students: isAdmin
  };

  // Check if current page is allowed and redirect if not
  useEffect(() => {
    if (!isAdmin && (currentPage === 'home' || currentPage === 'projects'|| currentPage === 'students')) {
      navigate('/tasks'); // Redirect to tasks page
    }
  }, [currentPage, isAdmin, navigate]);

  // Define component-specific props
  const pageComponents = {
    home: <Home />,
    projects: <Projects onAddProject={onOpenProjectForm} />,
    tasks: (
      <Tasks 
        onAddTask={onOpenTaskForm} 
        username={username} 
        isAdmin={isAdmin} 
      />
    ),
    chat: <Chat username={username} />,
    students: <Students />
  };

  // If user shouldn't be on this page (but hasn't redirected yet)
  if (!pageAccess[currentPage]) {
    return (
      <div className={`flex-grow flex items-center justify-center ${
        theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'
      }`}>
        <div className={`text-center p-6 rounded-lg ${
          theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'
        }`}>
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}>
            Access Denied
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Redirecting you to the tasks page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-grow overflow-y-auto ${
      theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'
    }`}>
      {pageComponents[currentPage]}
    </div>
  );
};

export default PageBox;