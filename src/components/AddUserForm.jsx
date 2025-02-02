import React from 'react';
import RegistrationForm from './RegistrationForm'; // Reusing RegistrationForm

const AddUserForm = ({ onRegister, onCancel }) => {
  return (
    <div>
      <h3>Add New User</h3>
      <RegistrationForm onRegister={onRegister} />
      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default AddUserForm;
