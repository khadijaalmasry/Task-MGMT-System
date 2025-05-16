import React from 'react';
import { useTheme } from "../../context/themeContext";

const ResetPasswordModal = ({
  visible,
  onClose,
  onSubmit,
  student,
  newPassword,
  setNewPassword
}) => {
  const { theme } = useTheme();

  if (!visible || !student) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 
      ${theme === 'dark' ? 'bg-black bg-opacity-70' : 'bg-gray-500 bg-opacity-50'}`}>
      <div className={`p-6 rounded-lg shadow-lg w-96
        ${theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'}`}>
        <h3 className={`text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-primary-dark' : 'text-primary-light'}`}>
          Reset Password for {student?.name}
        </h3>
        <input
          type="password"
          placeholder="New password"
          className={`w-full p-2 mb-4 border rounded
            ${theme === 'dark' 
              ? 'border-[#919191] bg-card-dark text-text-dark' 
              : 'border-gray-300 bg-card-light text-text-light'}`}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded
              ${theme === 'dark' 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-gray-300 hover:bg-gray-400'}`}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`px-4 py-2 rounded text-white
              ${theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;