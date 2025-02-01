import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [staff, setStaff] = useState([]);
  const [newStaffName, setNewStaffName] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    fetchStaff();

    ws.current = new WebSocket('ws://localhost:3000');

    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'staff_update') {
        setStaff(message.staff);
      }
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  const sendWebSocketMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const toggleAvailability = async (id) => {
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !staff.find(member => member.id === id).available }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedMember = await response.json();
      // No need to update state here, WebSocket will push update
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  const getNextAvailableStaff = (count) => {
    const availableStaff = staff.filter(member => member.available);
    return availableStaff.slice(0, Math.min(availableStaff.length, count));
  };

  const getNextAvailableStaffLarge = () => {
    const availableStaff = getNextAvailableStaff(6);
    if (availableStaff.length < 4) {
      return [];
    }
    return availableStaff;
  };

  const rotateStaff = async () => {
    try {
      const response = await fetch('/api/rotate-staff', { // Changed endpoint to /api/rotate-staff
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // No need to update state here, WebSocket will push update
    } catch (error) {
      console.error("Failed to rotate staff:", error);
    }
  };


  const addStaff = async () => {
    console.log("addStaff function called"); // ADDED LOG
    if (newStaffName.trim() !== '') {
      try {
        console.log("Attempting to add staff member:", newStaffName); // ADDED LOG
        const response = await fetch('/api/staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newStaffName }),
        });
        if (!response.ok) {
          console.error("HTTP error adding staff:", response.status); // ADDED LOG
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newMember = await response.json();
        console.log("Staff member added successfully:", newMember); // ADDED LOG
        setNewStaffName('');
        // No need to update state here, WebSocket will push update
      } catch (error) {
        console.error("Failed to add staff:", error);
      }
    }
  };


  const removeStaff = async (id) => {
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (response.status === 200) {
        // No need to update state here, WebSocket will push update
      } else {
        console.error("Failed to remove staff, server response was not successful");
      }
    } catch (error) {
      console.error("Failed to remove staff:", error);
    }
  };


  const availableStaffSmall = getNextAvailableStaff(2);
  const availableStaffLarge = getNextAvailableStaffLarge();


  return (
    <div className="container">
      <h1>Staff Availability</h1>

      <div className="top-lists availability-lists">
        <div className="bowser-list-section">
          <h2>Bowser</h2>
          {availableStaffSmall.length > 0 ? (
            <ul className="bowser-list">
              {availableStaffSmall.map(member => (
                <li key={member.id} className="bowser-item">{member.name}</li>
              ))}
            </ul>
          ) : (
            <p>No staff available.</p>
          )}
        </div>

        <div className="pump-list-section">
          <h2>Pump</h2>
          {availableStaffLarge.length >= 4 ? (
            <ul className="pump-list">
              {availableStaffLarge.map(member => (
                <li key={member.id} className="pump-item">{member.name}</li>
              ))}
            </ul>
          ) : (
            <p>Unavailable</p>
          )}
        </div>
      </div>

      <div className="top-rotate rotate-staff-section">
        <button onClick={rotateStaff} className="rotate-button">Rotate Staff</button>
      </div>

      <div className="add-staff">
        <input
          type="text"
          placeholder="Enter staff name"
          value={newStaffName}
          onChange={(e) => setNewStaffName(e.target.value)}
          className="add-staff-input"
        />
        <button onClick={addStaff} className="add-staff-button">Add Staff</button>
      </div>

      <ul className="staff-list">
        {staff.map(member => (
          <li key={member.id} className="staff-item">
            <span className="staff-name">
              {member.name} - {member.available ? <strong className="available">Available</strong> : <strong className="unavailable">Unavailable</strong>}
            </span>
            <div className="staff-actions">
              <button onClick={() => toggleAvailability(member.id)} className="toggle-button">
                Toggle Availability
              </button>
              <button onClick={() => removeStaff(member.id)} className="remove-button">
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
