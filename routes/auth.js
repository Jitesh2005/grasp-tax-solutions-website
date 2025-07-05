const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const path = require('path');

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/register.html'));
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 12);

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (result.length > 0) return res.send('User already exists');
    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed],
      (err) => {
        if (err) return res.status(500).send('Error creating user');
        res.redirect('/login');
      }
    );
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) return res.status(500).send('Database error');
    if (result.length === 0) return res.send('❌ Invalid credentials');

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('❌ Invalid credentials');

    // ✅ Set session once including role
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // ✅ Role-based redirect with return
    if (user.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/dashboard');
    }
  });
});


router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});


const { decryptFile } = require('../utils/crypto');
const os = require('os');
const fs = require('fs');

router.get('/download/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const fileId = req.params.id;
  const userId = req.session.user.id;

  // 1. Fetch file from DB
  db.query('SELECT * FROM uploads WHERE id = ? AND user_id = ?', [fileId, userId], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).send('<h2>❌ Access Denied or File Not Found</h2>');
    }

    const fileRecord = results[0];
    const encryptedPath = fileRecord.filepath;
    const originalName = fileRecord.filename;
    const decryptedPath = path.join(os.tmpdir(), originalName);

    try {
      // 2. Decrypt the file
      await decryptFile(encryptedPath, decryptedPath);

      // 3. Send it to user
      res.download(decryptedPath, originalName, (err) => {
        if (err) console.error('Download error:', err);
        fs.unlink(decryptedPath, () => { }); // clean temp
      });
    } catch (err) {
      console.error('Decryption failed:', err);
      res.status(500).send('<h2>❌ File Decryption Failed</h2>');
    }
  });
});

const { requireAdmin } = require('../middleware/authMiddleware');

// Admin Dashboard
router.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin.html'));
  db.query(
    `SELECT uploads.id, uploads.filename, users.name AS owner, uploads.uploaded_at 
     FROM uploads 
     JOIN users ON uploads.user_id = users.id 
     ORDER BY uploads.uploaded_at DESC`,
    (err, files) => {
      if (err) {
        console.error('Admin file fetch error:', err);
        return res.status(500).send('Error fetching uploads.');
      }

      let html = `
        <h2>Admin File Dashboard</h2>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr><th>File</th><th>User</th><th>Uploaded At</th><th>Download</th></tr>
          ${files.map(f => `
            <tr>
              <td>${f.filename}</td>
              <td>${f.owner}</td>
              <td>${new Date(f.uploaded_at).toLocaleString()}</td>
              <td><a href="/download/${f.id}">Download</a></td>
            </tr>
          `).join('')}
        </table>
      `;
      res.send(html);
    }
  );
});


module.exports = router;