import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/themeContext';

const SIGN_UP_MUTATION = gql`
  mutation SignUp($name: String!, $password: String!, $isAdmin: Boolean, $universityId: String) {
    signUp(name: $name, password: $password, isAdmin: $isAdmin, universityId: $universityId) {
      token
      user {
        _id
        name
        isAdmin
        universityId
      }
    }
  }
`;

const SignUpPopup = ({ onClose }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [universityId, setUniversityId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const { theme } = useTheme();

  const [signUp, { loading }] = useMutation(SIGN_UP_MUTATION, {
    onCompleted: (data) => {
      if (data?.signUp) {
        const { token, user } = data.signUp;
        login(token, user, true);
        onClose();
      }
    },
    onError: (err) => {
      console.error('Sign up error:', err);
      setErrorMessage(
        err.message.includes('Username already exists')
          ? 'Username is already taken'
          : 'Failed to create account. Please try again.'
      );
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      await signUp({
        variables: {
          name,
          password,
          isAdmin: false,
          universityId: isStudent ? universityId : null
        }
      });
    } catch (err) {
      // Error is handled by onError callback
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[1000]">
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded-lg w-[400px] max-h-[85%] max-w-full shadow-md relative flex flex-col gap-4 overflow-y-auto ${
          theme === 'dark' 
            ? 'bg-card-dark text-text-dark' 
            : 'bg-card-light text-text-light'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-2.5 right-4 text-2xl cursor-pointer bg-transparent border-none ${
            theme === 'dark' ? 'text-text-dark' : 'text-text-light'
          }`}
        >
          &times;
        </button>

        <h1 className={`text-2xl mb-2 text-center ${
          theme === 'dark' 
            ? 'text-primary-dark' 
            : 'text-primary-light'
        }`}>
          Sign Up
        </h1>

        {errorMessage && (
          <div className={`border px-4 py-3 rounded relative mb-4 ${
            theme === 'dark'
              ? 'bg-red-900/30 border-red-700 text-red-300'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={`text-sm font-bold block mb-1 ${
              theme === 'dark' ? 'text-text-dark' : 'text-text-light'
            }`}>
              Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2 text-sm border rounded box-border ${
                theme === 'dark'
                  ? 'bg-[#313131] border-gray-600 text-text-dark'
                  : 'bg-white border-gray-300 text-text-light'
              }`}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className={`text-sm font-bold block mb-1 ${
              theme === 'dark' ? 'text-text-dark' : 'text-text-light'
            }`}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 text-sm border rounded box-border ${
                theme === 'dark'
                  ? 'bg-[#313131] border-gray-600 text-text-dark'
                  : 'bg-white border-gray-300 text-text-light'
              }`}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isStudent"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
              className={`mr-2 ${
                theme === 'dark' 
                  ? 'accent-primary-dark' 
                  : 'accent-primary-light'
              }`}
            />
            <label htmlFor="isStudent" className={`text-sm font-bold ${
              theme === 'dark' ? 'text-text-dark' : 'text-text-light'
            }`}>
              I'm a student
            </label>
          </div>

          {isStudent && (
            <div>
              <label className={`text-sm font-bold block mb-1 ${
                theme === 'dark' ? 'text-text-dark' : 'text-text-light'
              }`}>
                University ID
              </label>
              <input
                type="text"
                required={isStudent}
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className={`w-full p-2 text-sm border rounded box-border ${
                  theme === 'dark'
                    ? 'bg-[#313131] border-gray-600 text-text-dark'
                    : 'bg-white border-gray-300 text-text-light'
                }`}
                placeholder="Enter your university ID"
              />
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className={`text-base py-2 px-6 rounded transition duration-300 transform hover:scale-105 disabled:opacity-50 ${
              theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpPopup;