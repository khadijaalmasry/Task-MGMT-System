import React from 'react';
import { useTheme } from '../context/themeContext.jsx'; 
import ThemeToggle from './themeToggle.jsx';

const LandingPage = ({ onSignUpClick, onSignInClick }) => {
  const { theme } = useTheme();

  return (
    <div className={`h-screen w-full flex items-center justify-center ${
      theme === 'dark' 
        ? 'bg-background-dark text-text-dark' 
        : 'bg-background-light text-text-light'
    }`}>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-6 ${
          theme === 'dark' 
            ? 'text-primary-dark' 
            : 'text-primary-light'
        }`}>
          Welcome to the Task Management System
        </h1>
        
        <p className={`text-lg mb-8 ${
          theme === 'dark' 
            ? 'text-gray-400' 
            : 'text-gray-600'
        }`}>
          Please sign in or sign up to continue.
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onSignInClick}
            className={`py-2 px-6 rounded transition duration-200 ${
              theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            Sign In
          </button>
          <button
            onClick={onSignUpClick}
            className={`py-2 px-6 rounded transition duration-200 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;