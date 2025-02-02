import React from 'react';

const AvailabilityDashboard = ({ firefighters, toggleAvailability, currentUser, updateUserRole, recordApplianceRide, removeFirefighter }) => {
  if (!firefighters) {
    return <p>Loading firefighters...</p>;
  }

  const canManageRole = (userRole, targetRole) => {
    if (userRole === 'admin') return true;
    if (userRole === 'watch_manager') return true;
    if (userRole === 'crew_manager' && targetRole === 'firefighter') return true;
    return false;
  };
  const canRemoveUser = (userRole, targetRole) => {
    if (userRole === 'admin') return true;
    if (userRole === 'watch_manager') return true;
    if (userRole === 'crew_manager' && targetRole === 'firefighter') return true;
    return false;
  };

  const handleRoleChange = (id, newRole) => {
    updateUserRole(id, newRole);
  };

  const handleRideRecorded = (id) => {
    recordApplianceRide(id);
  };
  const handleRemoveFirefighter = (id) => {
    removeFirefighter(id);
  };


  // No more sorting by hasRiddenAppliance - just use the order of firefighters array
  const sortedFirefighters = [...firefighters]; // Still create a copy for filtering

  console.log("Sorted Firefighters:", JSON.stringify(sortedFirefighters.map(ff => ({ name: ff.name })), null, 2)); // Updated log

  const filteredFirefighters = sortedFirefighters.filter(ff => ff.role !== 'admin');

  console.log("AvailabilityDashboard Render");

  return (
    <div className="availability-dashboard">
      <h2>Availability Dashboard</h2>
      <ul>
        {filteredFirefighters.map(ff => (
          <li key={ff.id} className={`availability-row ${ff.available ? 'available' : 'unavailable'}`}>
            <div className="user-info">
              {ff.name}
            </div>
            {/* Status Indicator Column Removed */}
            <div className="actions">
              <div className="actions-row"> {/* Row for Availability Toggle and Confirm Ride - TOP ROW */}
                {ff.role === 'firefighter' && currentUser && currentUser.role === 'firefighter' && currentUser.id === ff.id && (
                  <button onClick={() => toggleAvailability(ff.id)}>
                    {ff.available ? 'Available' : 'Unavailable'}
                  </button>
                )}
                {currentUser && (currentUser.role === 'crew_manager' || currentUser.role === 'watch_manager' || currentUser.role === 'admin') && ff.role === 'firefighter' && (
                  <button onClick={() => toggleAvailability(ff.id)}>
                    {ff.available ? 'Available' : 'Unavailable'}
                  </button>
                )}
                {currentUser && (currentUser.role === 'watch_manager' || currentUser.role === 'admin') && (ff.role === 'crew_manager' || ff.role === 'watch_manager') && (
                  <button onClick={() => toggleAvailability(ff.id)}>
                    {ff.available ? 'Available' : 'Unavailable'}
                  </button>
                )}
                {(currentUser && (
                  (currentUser.role === 'firefighter' && currentUser.id === ff.id) ||
                  currentUser.role === 'crew_manager' ||
                  currentUser.role === 'watch_manager' ||
                  currentUser.role === 'admin'
                )) && (
                  <button onClick={() => handleRideRecorded(ff.id)}>
                    Confirm Ride
                  </button>
                )}
              </div>
              <div className="actions-row"> {/* Row for Role Select and Remove User - BOTTOM ROW */}
                {canManageRole(currentUser?.role, ff.role) && (
                  <select
                    defaultValue={ff.role}
                    onChange={(e) => handleRoleChange(ff.id, e.target.value)}
                    disabled={ff.role === 'admin'}
                  >
                    <option value="firefighter">Firefighter</option>
                    <option value="crew_manager">Crew Manager</option>
                    <option value="watch_manager">Watch Manager</option>
                  </select>
                )}
                {(currentUser && canRemoveUser(currentUser.role, ff.role) ) && ( // Remove User Button
                  <button className="remove-user-button" onClick={() => handleRemoveFirefighter(ff.id)}>
                    Remove User
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AvailabilityDashboard;
