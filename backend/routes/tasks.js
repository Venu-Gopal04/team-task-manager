const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET tasks (filter by project or all)
router.get('/', authenticate, async (req, res) => {
  const { projectId } = req.query;
  try {
    let query, params;
    if (req.user.role === 'admin') {
      if (projectId) {
        query = `SELECT t.*, u.name as assignee_name, p.name as project_name 
                 FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id 
                 JOIN projects p ON t.project_id = p.id WHERE t.project_id = $1 ORDER BY t.due_date ASC NULLS LAST`;
        params = [projectId];
      } else {
        query = `SELECT t.*, u.name as assignee_name, p.name as project_name 
                 FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id 
                 JOIN projects p ON t.project_id = p.id ORDER BY t.due_date ASC NULLS LAST`;
        params = [];
      }
    } else {
      query = `SELECT t.*, u.name as assignee_name, p.name as project_name 
               FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id 
               JOIN projects p ON t.project_id = p.id
               JOIN project_members pm ON p.id = pm.project_id
               WHERE pm.user_id = $1 ${projectId ? 'AND t.project_id = $2' : ''} ORDER BY t.due_date ASC NULLS LAST`;
      params = projectId ? [req.user.id, projectId] : [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create task (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { title, description, projectId, assigneeId, dueDate, priority } = req.body;
  if (!title || !projectId) return res.status(400).json({ message: 'Title and project required' });
  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, project_id, assignee_id, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'todo') RETURNING *`,
      [title, description || '', projectId, assigneeId || null, dueDate || null, priority || 'medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH update task status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['todo', 'in_progress', 'done'];
  if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (task.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    const t = task.rows[0];
    if (req.user.role !== 'admin' && t.assignee_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const result = await pool.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update task (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { title, description, assigneeId, dueDate, priority, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, assignee_id=$3, due_date=$4, priority=$5, status=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title, description, assigneeId || null, dueDate || null, priority, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE task (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;