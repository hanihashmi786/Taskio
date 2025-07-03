import React, { useState } from 'react';
import axios from 'axios';

const Signin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [message, setMessage] = useState(''); // For login status

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // clear previous messages
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/accounts/login/',
        formData
      );
      localStorage.setItem('access_token', response.data.access_token);
      setMessage('Login successful! 🎉');
    } catch (error) {
      setMessage(
        error.response && error.response.data
          ? error.response.data.error || 'Login failed!'
          : 'Login failed!'
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>

        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Sign In
        </button>

        {/* Show login result message */}
        {message && (
          <div
            className={`mt-2 text-center font-medium ${
              message.includes('successful') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default Signin;
