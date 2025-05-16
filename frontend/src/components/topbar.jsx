import React from 'react';
import ThemeToggle from './themeToggle.jsx';

const Topbar = ({ username, onSignIn }) => {
  return (
    <div className="col-span-2 h-[5vh] shadow-md w-full flex items-center justify-between px-5 bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
      <div className="flex items-center">
        <ThemeToggle />
      </div>
      <div className="flex items-center space-x-4">
        {username && (
          <span className="text-base font-bold">
            {username}
          </span>
        )}
        <button
          onClick={onSignIn}
          className="bg-red-600 hover:bg-red-700 dark:hover:bg-red-800 text-white text-sm rounded px-3 py-1 transition duration-300 transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;