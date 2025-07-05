const multer = require('multer');
const uploadPath = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + file.originalname;
        cb(null, unique);
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('secureFile'), (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const { id: user_id } = req.session.user;
    const filename = req.file.filename;
    const filepath = req.file.path;

    db.query(
        'INSERT INTO uploads (user_id, filename, filepath) VALUES (?, ?, ?)',
        [user_id, filename, filepath],
        (err) => {
            if (err) {
                console.error('Upload DB error:', err);
                return res.status(500).send('Upload failed');
            }
            res.send(`<h2>File uploaded successfully!</h2><a href="/dashboard">Back to Dashboard</a>`);
        }
    );
});
