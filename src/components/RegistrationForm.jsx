import React, { useState } from 'react';

const RegistrationForm = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('firefighter');

  const handleSubmit = (event) => {
    event.preventDefault();
    onRegister({ name, username, password, role });
    setName('');
    setUsername('');
    setPassword('');
    setRole('firefighter');
  };

  return (
    <div>
      <h3>Register New Staff Member</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="firefighter">Firefighter</option>
            <option value="crew_manager">Crew Manager</option>
            <option value="watch_manager">Watch Manager</option>
            {/* Admin role is intentionally NOT included in registration form */}
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
