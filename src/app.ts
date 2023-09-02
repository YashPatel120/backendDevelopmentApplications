// src/app.ts
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { Task } from './types'; // Create a types.ts file for defining types

const app = express();
const port = process.env.PORT || 3000;

// Create a SQLite database connection
const db = new sqlite3.Database(':memory:'); // You can replace ':memory:' with a file path for a persistent database

// Define API endpoints
app.use(express.json());

// Create a table for tasks in the database
db.serialize(() => {
  db.run('CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, completed BOOLEAN)');
});

app.get('/tasks', (req: Request, res: Response) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/tasks', (req: Request, res: Response) => {
  const task: Task = req.body;
  if (!task.title || typeof task.completed !== 'boolean') {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  db.run('INSERT INTO tasks (title, completed) VALUES (?, ?)', [task.title, task.completed], function (err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ id: this.lastID, ...task });
    }
  });
});

app.put('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task: Task = req.body;
  if (!task.title || typeof task.completed !== 'boolean') {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  db.run('UPDATE tasks SET title = ?, completed = ? WHERE id = ?', [task.title, task.completed, id], (err) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ id: +id, ...task });
    }
  });
});

app.delete('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', id, (err) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ message: 'Task deleted successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
