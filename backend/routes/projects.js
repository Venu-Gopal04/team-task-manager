const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET all projects for user
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = 'SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id ORDER BY p.created_at DESC';
      params = [];
    } else {
      query = `SELECT p.*, u.name as owner_name FROM projects p 
               JOIN users u ON p.owner_id = u.id
               JOIN project_members pm ON p.id = pm.project_id 
               WHERE pm.user_id = $1 ORDER BY p.created_at DESC`;
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create project (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name required' });
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', req.user.id]
    );
    const project = result.rows[0];
    await pool.query('INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)', [project.id, req.user.id]);
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add member to project (admin only)
router.post('/:id/members', authenticate, requireAdmin, async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, userId]
    );
    res.json({ message: 'Member added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET members of a project
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role FROM users u
       JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE project (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;