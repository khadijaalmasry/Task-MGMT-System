import React from 'react';
import { useTheme } from "../../context/themeContext";

const DeleteConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
  itemName,
  itemType = "item"
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 
      ${theme === 'dark' ? 'bg-black bg-opacity-70' : 'bg-gray-500 bg-opacity-50'}`}>
      <div className={`p-6 rounded-lg shadow-lg w-96
        ${theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'}`}>
        <h3 className={`text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'}`}>
          Confirm Deletion
        </h3>
        <p className={`mb-4 ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>
          Are you sure you want to delete {itemName}? This {itemType} cannot be recovered.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded
              ${theme === 'dark' 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-gray-300 hover:bg-gray-400'}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white
              ${theme === 'dark' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-red-500 hover:bg-red-600'}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;