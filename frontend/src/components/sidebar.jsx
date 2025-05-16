import React from 'react';
import { useTheme } from '../context/themeContext'; 
const Sidebar = ({ onTabClick, isAdmin }) => {
  const { theme } = useTheme();
  const tabs = isAdmin
    ? ['home', 'projects', 'tasks', 'chat', 'students']
    : ['tasks', 'chat'];

  return (
    <div className={`col-span-1 row-span-1 p-4 w-[20vw] text-center h-[95vh] overflow-y-auto 
      ${theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'}`}>
      <ul className="list-none p-0 m-0">
        {tabs.map((tab) => (
          <li key={tab}>
            <button
              onClick={() => onTabClick(tab)}
              className={`block w-full px-5 py-2 mb-2 no-underline rounded text-base text-center 
                transition duration-300 transform hover:scale-105
                ${theme === 'dark' 
                  ? 'bg-[#484849] text-text-dark hover:bg-primary-dark' 
                  : 'bg-gray-200 text-text-light hover:bg-primary-light'}`}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;