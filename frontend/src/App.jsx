import React, { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient.js';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import './index.css';
import Topbar from './components/topbar.jsx';
import Sidebar from './components/sidebar.jsx';
import Pagebox from './components/pagebox.jsx';
import SignupModal from './components/modals/signUpModal.jsx';
import SigninModal from './components/modals/signInModal.jsx';
import AddProjectModal from './components/modals/addProjectModal.jsx';
import AddTaskModal from './components/modals/addTaskModal.jsx';
import LandingPage from './components/landingPage.jsx';
import  {ThemeProvider}  from './context/themeContext.jsx';

function AppContent() {
  const [currentPage, setCurrentPage] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();

  // Set default or persisted page
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      setCurrentPage(savedPage);
    } else {
      // Default page depending on role
      const defaultPage = user.isAdmin ? 'home' : 'tasks';
      setCurrentPage(defaultPage);
      localStorage.setItem('currentPage', defaultPage);
    }
  }, [isLoggedIn, user]);

  // Save page when changed
  useEffect(() => {
    if (currentPage) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  return (
    <>
      {!isLoggedIn ? (
        <>
          <LandingPage
            onSignUpClick={() => setShowSignup(true)}
            onSignInClick={() => setShowSignin(true)}
          />
          {showSignup && (
            <SignupModal
              onClose={() => setShowSignup(false)}
              onSuccess={() => setShowSignup(false)}
            />
          )}
          {showSignin && (
            <SigninModal
              onClose={() => setShowSignin(false)}
              onSuccess={() => setShowSignin(false)}
            />
          )}
        </>
      ) : (
        <>
          <Topbar username={user?.name} onSignIn={logout} />
          <div className="flex">
            <Sidebar
              onTabClick={setCurrentPage}
              isAdmin={user?.isAdmin || false}
            />
            <Pagebox
              currentPage={currentPage}
              username={user?.name}
              onOpenProjectForm={() => setShowAddProject(true)}
              onOpenTaskForm={() => setShowAddTask(true)}
              isAdmin={user?.isAdmin || false}
            />
          </div>
          {showAddProject && (
            <AddProjectModal onClose={() => setShowAddProject(false)} />
          )}
          {showAddTask && (
            <AddTaskModal onClose={() => setShowAddTask(false)} />
          )}
        </>
      )}
    </>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
        <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;