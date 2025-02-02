import React from 'react';

const ResourceDashboard = ({ firefighters }) => {
  const resources = [
    { name: 'Pump', minCapacity: 4, maxCapacity: 6, assigned: [] },
    { name: 'Bowser', minCapacity: 2, maxCapacity: 2, assigned: [] },
  ];

  // Get available firefighters - INCLUDING ALL ROLES
  let availableFirefighters = firefighters
    .filter(ff => ff.available); // Filter by availability only, include all roles

  // Create separate arrays for Bowser and Pump assignments
  const bowserAssigned = [];
  const pumpAssigned = [];

  // **BOWSER ASSIGNMENT - Use SLICE of availableFirefighters**
  let bowserAvailable = availableFirefighters.slice(); // Create a slice for Bowser
  if (bowserAvailable.length >= resources[1].minCapacity) { // resources[1] is Bowser
    bowserAssigned.push(...bowserAvailable.slice(0, resources[1].maxCapacity).map(ff => ff.name));
    // Do NOT modify availableFirefighters here for Bowser
  } else {
    bowserAssigned.push('Off the run');
  }

  // **PUMP ASSIGNMENT - Use SLICE of availableFirefighters AGAIN**
  let pumpAvailable = availableFirefighters.slice(); // Create a NEW slice for Pump
  if (pumpAvailable.length >= resources[0].minCapacity) { // resources[0] is Pump
    pumpAssigned.push(...pumpAvailable.slice(0, resources[0].maxCapacity).map(ff => ff.name));
     // Do NOT modify availableFirefighters here for Pump
  } else {
    pumpAssigned.push('Off the run');
  }

  // Update resource assigned lists
  resources[0].assigned = pumpAssigned;
  resources[1].assigned = bowserAssigned;


  return (
    <div className="resource-dashboard"> {/* Added class for styling */}
      <h2>Resource Dashboard</h2>
      <ul>
        {resources.map(resource => (
          <li key={resource.name} className="resource-item"> {/* Added class for styling */}
            <h3>
              {resource.name} {resource.name === 'Pump' ? `(Capacity ${resource.minCapacity} - ${resource.maxCapacity})` : `(Capacity ${resource.maxCapacity})`} {/* Capacity next to name */}
            </h3>
            <div>
              Assigned Firefighters:
              <ul className="assigned-firefighters-list"> {/* Added class for styling */}
                {resource.assigned.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceDashboard;
