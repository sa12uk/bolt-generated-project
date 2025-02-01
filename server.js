import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'thetechsupportguy.co.uk',
  user: 'acbreach_fireservice',
  password: 'Vydr7!LYwBNo7DWV',
  database: 'acbreach_fireservice'
};

async function getConnection() {
  return mysql.createConnection(dbConfig);
}

// GET staff
app.get('/api/staff', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM staff_availability');
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
    const [result] = await connection.execute('INSERT INTO staff_availability (name, available) VALUES (?, ?)', [name, false]);
    const [rows] = await connection.execute('SELECT * FROM staff_availability WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
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
    res.json(rows[0]);
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
    connection.end();
  } catch (error) {
    console.error("Database delete failed", error);
    res.status(500).json({ error: 'Failed to remove staff' });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
