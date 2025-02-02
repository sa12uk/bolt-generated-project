import React, { useState } from 'react';

const UserProfile = ({ user, onPasswordChange, onNameChange }) => {
  const [newName, setNewName] = useState(user.name);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setPasswordMatchError('');

    if (newPassword && newPassword !== confirmPassword) {
      setPasswordMatchError('Passwords do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setPasswordMatchError('Password must be at least 6 characters long.');
      return;
    }

    if (newName && newName !== user.name) {
      onNameChange(newName);
    }

    if (newPassword) {
      onPasswordChange(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      <div>
        <label htmlFor="newName">Name:</label>
        <input
          type="text"
          id="newName"
          value={newName}
          onChange={handleNameChange}
        />
      </div>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <h3>Change Password</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {passwordMatchError && <p className="error">{passwordMatchError}</p>}
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default UserProfile;
