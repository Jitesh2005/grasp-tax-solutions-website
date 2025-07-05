function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}
module.exports = ensureAuthenticated;


function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('<h2>❌ Admin Access Only</h2>');
    }
}
module.exports = { requireAdmin };

