import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/themeContext';

const SIGN_IN_MUTATION = gql`
  mutation SignIn($name: String!, $password: String!) {
    signIn(name: $name, password: $password) {
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

const SignInModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const { theme } = useTheme();
  const [signIn, { loading }] = useMutation(SIGN_IN_MUTATION, {
    onCompleted: (data) => {
      if (data?.signIn) {
        const { token, user } = data.signIn;
        login(token, user, stayLoggedIn);
        onClose();
      }
    },
    onError: (err) => {
      console.error('Sign in error:', err);
      setErrorMessage(
        err.message.includes('Invalid username or password') 
          ? 'Invalid username or password' 
          : 'Sign in failed. Please try again.'
      );
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await signIn({
        variables: { name, password },
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
          Sign In
        </h1>

        {errorMessage && (
          <div className={`border px-4 py-3 rounded relative ${
            theme === 'dark'
              ? 'bg-red-900/30 border-red-700 text-red-300'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {errorMessage}
          </div>
        )}

        <label className={`text-sm font-bold block ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Username
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-2 text-sm border rounded box-border ${
            theme === 'dark'
              ? 'bg-[#313131] border-gray-600 text-text-dark'
              : 'bg-white border-gray-300 text-text-light'
          }`}
        />

        <label className={`text-sm font-bold block ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full p-2 text-sm border rounded box-border ${
            theme === 'dark'
              ? 'bg-[#313131] border-gray-600 text-text-dark'
              : 'bg-white border-gray-300 text-text-light'
          }`}
        />

        <label className={`flex items-center text-sm font-bold ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          <input
            type="checkbox"
            checked={stayLoggedIn}
            onChange={(e) => setStayLoggedIn(e.target.checked)}
            className={`mr-2 ${
              theme === 'dark' 
                ? 'accent-primary-dark' 
                : 'accent-primary-light'
            }`}
          />
          Stay logged in
        </label>

        <div className="flex justify-center mt-2">
          <button
            type="submit"
            className={`text-base py-2 px-4 rounded transition duration-300 transform hover:scale-105 ${
              theme === 'dark'
                ? 'bg-primary-dark hover:bg-blue-700 text-white'
                : 'bg-primary-light hover:bg-blue-600 text-white'
            }`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignInModal;