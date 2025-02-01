import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'thetechsupportguy.co.uk',
  user: 'acbreach_fireservice',
  password: 'Vydr7!LYwBNo7DWV', // IMPORTANT: Using provided password
  database: 'acbreach_fireservice' // IMPORTANT: Using provided database name
};

async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Database connection successful"); // ADDED LOG
    return connection;
  } catch (error) {
    console.error("Database connection failed", error); // ADDED LOG
    throw error; // Re-throw to prevent server from starting if DB fails
  }
}

const wss = new WebSocketServer({ port: 3001 }); // WebSocket server on a different port
const clients = new Set(); // Keep track of connected clients

wss.on('connection', ws => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

function broadcastStaffUpdate(staff) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'staff_update', staff: staff }));
    }
  });
}


// GET staff
app.get('/api/staff', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM staff_availability ORDER BY `order` ASC');
    res.json(rows);
    connection.end();
  } catch (error) {
    console.error("Database query failed", error);
    res.status(500).json({ error: 'Failed to fetch staff data' });
  }
});

// POST staff (add new staff)
app.post('/api/staff', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const connection = await getConnection();
    console.log("Adding staff member to database:", name); // ADDED LOG
     // Get the current maximum order value
     const [maxOrderResult] = await connection.execute("SELECT MAX(`order`) AS max_order FROM staff_availability");
     const nextOrder = maxOrderResult[0].max_order ? maxOrderResult[0].max_order + 1 : 1;

    const [result] = await connection.execute('INSERT INTO staff_availability (name, available, `order`) VALUES (?, ?, ?)', [name, false, nextOrder]);
    const [rows] = await connection.execute('SELECT * FROM staff_availability WHERE id = ?', [result.insertId]);
    const newStaff = rows[0];
    res.status(201).json(newStaff);
    console.log("Staff member added to database:", newStaff); // ADDED LOG

    // Re-fetch and broadcast updated staff list
    const [updatedStaffList] = await connection.execute('SELECT * FROM staff_availability ORDER BY `order` ASC');
    broadcastStaffUpdate(updatedStaffList[0]);
    console.log("Broadcasting staff update via WebSocket"); // ADDED LOG

    connection.end();
  } catch (error) {
    console.error("Database insert failed", error);
    res.status(500).json({ error: 'Failed to add staff' });
  }
});

// PUT staff (update availability)
app.put('/api/staff/:id', async (req, res) => {
  const id = req.params.id;
  const { available } = req.body;
  if (available === undefined) {
    return res.status(400).json({ error: 'Availability status is required' });
  }
  try {
    const connection = await getConnection();
    await connection.execute('UPDATE staff_availability SET available = ? WHERE id = ?', [available, id]);
    const [rows] = await connection.execute('SELECT * FROM staff_availability WHERE id = ?', [id]);
    const updatedMember = rows[0];
    res.json(updatedMember);

    // Re-fetch and broadcast updated staff list
    const [updatedStaffList] = await connection.execute('SELECT * FROM staff_availability ORDER BY `order` ASC');
    broadcastStaffUpdate(updatedStaffList[0]);

    connection.end();
  } catch (error) {
    console.error("Database update failed", error);
    res.status(500).json({ error: 'Failed to update staff availability' });
  }
});

// DELETE staff
app.delete('/api/staff/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const connection = await getConnection();
    await connection.execute('DELETE FROM staff_availability WHERE id = ?', [id]);
    res.json({ success: true, id: parseInt(id) });

     // Re-fetch and broadcast updated staff list
     const [updatedStaffList] = await connection.execute('SELECT * FROM staff_availability ORDER BY `order` ASC');
     broadcastStaffUpdate(updatedStaffList[0]);

    connection.end();
  } catch (error) {
    console.error("Database delete failed", error);
    res.status(500).json({ error: 'Failed to remove staff' });
  }
});

// POST rotate staff
app.post('/api/rotate-staff', async (req, res) => { // Changed to POST and new endpoint
  try {
    const connection = await getConnection();
     // Get current Bowser staff (ordered by 'order' column)
     const [bowserResult] = await connection.execute("SELECT * FROM staff_availability WHERE available = TRUE ORDER BY `order` ASC LIMIT 2");
     const bowserStaff = bowserResult[0] || [];

    if (bowserStaff.length > 0) {
      const bowserIds = bowserStaff.map(member => member.id);
      const idList = bowserIds.join(',');

      // Get remaining staff (ordered by 'order' column)
      const [remainingResult] = await connection.execute(`SELECT * FROM staff_availability WHERE id NOT IN (${idList}) ORDER BY \`order\` ASC`);
      const remainingStaff = remainingResult[0] || [];


      // Update order: move Bowser staff to the end
      let newOrder = 1; // Reset order from 1
      for (const member of remainingStaff) {
        await connection.execute('UPDATE staff_availability SET `order` = ? WHERE id = ?', [newOrder++, member.id]);
      }
      for (const member of bowserStaff) {
        await connection.execute('UPDATE staff_availability SET `order` = ? WHERE id = ?', [newOrder++, member.id]);
      }
    }

    // Re-fetch and broadcast updated staff list
    const [updatedStaffList] = await connection.execute('SELECT * FROM staff_availability ORDER BY `order` ASC');
    broadcastStaffUpdate(updatedStaffList[0]);

    res.json({ success: true });
    connection.end();
  } catch (error) {
    console.error("Database rotation failed", error);
    res.status(500).json({ error: 'Failed to rotate staff order' });
  }
});


const server = app.listen(port, async () => { // Make server start async to await DB connection
  console.log(`Server listening at http://localhost:${port}`);
  try {
    await getConnection(); // Test DB connection on server start
  } catch (error) {
    console.error("Server failed to start due to database connection error");
  }
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});
