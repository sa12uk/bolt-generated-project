import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import AvailabilityDashboard from './components/AvailabilityDashboard';
import ResourceDashboard from './components/ResourceDashboard';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import AddUserForm from './components/AddUserForm'; // Import AddUserForm

function App() {
  const [firefighters, setFirefighters] = useState(() => {
    localStorage.removeItem('firefighters');
    const storedFirefighters = localStorage.getItem('firefighters');
    return storedFirefighters ? JSON.parse(storedFirefighters) : [
      { id: 1, name: 'Firefighter 1', username: 'ff1', password: 'password1', available: true, role: 'firefighter' },
      { id: 2, name: 'Firefighter 2', username: 'ff2', password: 'password2', available: false, role: 'firefighter' },
      { id: 3, name: 'Crew Manager 1', username: 'cm1', password: 'password3', available: true, role: 'crew_manager' },
      { id: 4, name: 'Watch Manager 1', username: 'wm1', password: 'password4', available: true, role: 'watch_manager' },
      { id: 5, name: 'Admin User', username: 'admin', password: '79318382', role: 'admin' },
    ];
  });
  // Move showAddUserForm State Declaration to the TOP, after firefighters state
  const [showAddUserForm, setShowAddUserForm] = useState(false); // State for Add User Form
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true); // Login form is default
  const [showProfile, setShowProfile] = useState(false);


  const resetAllRideStatuses = useCallback(() => {
    // No more hasRiddenAppliance reset needed
    console.log('Daily reset function executed.');
  }, []); // Removed dependencies

  useEffect(() => {
    localStorage.setItem('firefighters', JSON.stringify(firefighters));
  }, [firefighters]);

  useEffect(() => {
    const resetRideStatusDaily = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const timeUntilMidnight = midnight.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        resetAllRideStatuses();
        const intervalId = setInterval(resetAllRideStatuses, 24 * 60 * 60 * 1000);
        return () => clearInterval(intervalId);
      }, timeUntilMidnight);

      return () => clearTimeout(timeoutId);
    };

    resetRideStatusDaily();
  }, [resetAllRideStatuses]);


  const addFirefighter = (newFirefighter) => {
    setFirefighters([...firefighters, { ...newFirefighter, id: firefighters.length + 1, available: true }]);
    setShowRegistrationForm(false);
    setShowLoginForm(true);
    setShowAddUserForm(false); // Hide Add User form if it was open
  };

  const removeFirefighter = (id) => {
    if (currentUser.id === id) {
      alert("You cannot remove yourself."); // Prevent user from removing themselves
      return;
    }
    setFirefighters(firefighters.filter(ff => ff.id !== id));
  };


  const toggleAvailability = (id) => {
    setFirefighters(firefighters.map(ff =>
      ff.id === id ? { ...ff, available: !ff.available } : ff
    ));
  };

  const login = (username, password) => {
    console.log('Login attempt:', { username, password });
    console.log('Current firefighters array:', JSON.stringify(firefighters, null, 2));
    const user = firefighters.find(ff => ff.username === username && ff.password === password);
    console.log('Found user:', user);
    if (user) {
      setCurrentUser(user);
      setShowLoginForm(false);
    } else {
      alert('Login failed. Invalid username or password.');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setShowProfile(false);
  };

  const updateUserPassword = (newPassword) => {
    if (currentUser) {
      const updatedFirefighters = firefighters.map(ff =>
        ff.id === currentUser.id ? { ...ff, password: newPassword } : ff
      );
      setFirefighters(updatedFirefighters);
      setCurrentUser({ ...currentUser, password: newPassword });
      setShowProfile(false);
      alert('Password updated successfully!');
    }
  };

  const updateUserName = (newName) => {
    if (currentUser) {
      const updatedFirefighters = firefighters.map(ff =>
        ff.id === currentUser.id ? { ...ff, name: newName } : ff
      );
      setFirefighters(updatedFirefighters);
      setCurrentUser({ ...currentUser, name: newName });
      setShowProfile(false);
      alert('Name updated successfully!');
    }
  };

  const updateUserRole = (id, newRole) => {
    setFirefighters(firefighters.map(ff =>
      ff.id === id ? { ...ff, role: newRole } : ff
    ));
    setFirefighters(updatedFirefighters);
    alert(`Role updated to ${newRole}`);
  };

  const recordApplianceRide = useCallback((id) => {
    setFirefighters(currentFirefighters => {
      const firefighterToMoveIndex = currentFirefighters.findIndex(ff => ff.id === id);
      if (firefighterToMoveIndex === -1) return currentFirefighters; // User not found

      const firefighterToMove = currentFirefighters[firefighterToMoveIndex];
      const remainingFirefighters = currentFirefighters.filter((_, index) => index !== firefighterToMoveIndex);
      return [...remainingFirefighters, firefighterToMove]; // Append to the end
    });
  }, [setFirefighters]);


  return (
    <>
      <h1>Firefighter Availability App</h1>

      {currentUser ? (
        <div>
          <p>Logged in as: <strong>{currentUser.name} ({currentUser.role})</strong></p>
          <button onClick={() => setShowProfile(!showProfile)}>
            {showProfile ? 'Hide Profile' : 'Show Profile'}
          </button>
          <button onClick={logout}>Logout</button>
          {(currentUser.role === 'admin' || currentUser.role === 'watch_manager' || currentUser.role === 'crew_manager') && ( // Add User Button
            <button onClick={() => setShowAddUserForm(!showAddUserForm)}>
              {showAddUserForm ? 'Hide Add User Form' : 'Add User'}
            </button>
          )}
        </div>
      ) : (
        <div>
          <button onClick={() => setShowLoginForm(true) & setShowRegistrationForm(false)}>
            Login
          </button>
          <button onClick={() => setShowRegistrationForm(true) & setShowLoginForm(false)}>
            Signup
          </button>
        </div>
      )}

      {showRegistrationForm && <RegistrationForm onRegister={addFirefighter} />}
      {showLoginForm && <LoginForm onLogin={login} />}
      {showProfile && currentUser && <UserProfile user={currentUser} onPasswordChange={updateUserPassword} onNameChange={updateUserName} />}
      {showAddUserForm && currentUser && (currentUser.role === 'admin' || currentUser.role === 'watch_manager' || currentUser.role === 'crew_manager') && ( // Conditionally render AddUserForm
        <AddUserForm onRegister={addFirefighter} onCancel={() => setShowAddUserForm(false)} />
      )}

      {currentUser && !showProfile && !showAddUserForm && (
        <>
          <ResourceDashboard firefighters={firefighters} /> {/* ResourceDashboard MOVED UP */}
          <AvailabilityDashboard firefighters={firefighters} toggleAvailability={toggleAvailability} currentUser={currentUser} updateUserRole={updateUserRole} recordApplianceRide={recordApplianceRide} removeFirefighter={removeFirefighter} /> {/* AvailabilityDashboard MOVED DOWN */}
        </>
      )}
       {currentUser && showProfile && (
        <UserProfile user={currentUser} onPasswordChange={updateUserPassword} onNameChange={updateUserName} />
      )}
    </>
  )
}

export default App
