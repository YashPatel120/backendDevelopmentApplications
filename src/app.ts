import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Create a SQLite database connection
const db = new sqlite3.Database(':memory:'); // You can replace ':memory:' with a file path for a persistent database

// Define a simple Task model
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Create a table for tasks in the database
db.serialize(() => {
  db.run('CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, completed BOOLEAN)');
});

// Define API endpoints
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
  const { title, completed } = req.body;
  if (!title || typeof completed !== 'boolean') {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  db.run('INSERT INTO tasks (title, completed) VALUES (?, ?)', [title, completed], function (err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ id: this.lastID, title, completed });
    }
  });
});

app.put('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  if (!title || typeof completed !== 'boolean') {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  db.run('UPDATE tasks SET title = ?, completed = ? WHERE id = ?', [title, completed, id], (err) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ id: +id, title, completed });
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