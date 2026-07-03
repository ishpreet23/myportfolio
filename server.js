require('dotenv').config();

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// View Engine
// ==========================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================
// Layout
// ==========================

app.use(expressLayouts);
app.set('layout', 'layout');

// ==========================
// Static Files
// ==========================

app.use(express.static(path.join(__dirname, 'public')));

// ==========================
// Global Variables
// ==========================

app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

// ==========================
// Routes
// ==========================

// Home
app.get('/', (req, res) => {
    res.render('home', {
        title: 'ISHPREET SINGH | Pushing Boundaries'
    });
});

// Work
app.get('/work', (req, res) => {
    res.render('work', {
        title: 'ISHPREET.X | WORK GALLERY'
    });
});

// Website Case Study
app.get('/website', (req, res) => {
    res.render('website', {
        title: 'InsideHost | Case Study',
        path: '/website'
    });
});

// Expertise
app.get('/expertise', (req, res) => {
    res.render('expertise', {
        title: 'ISHPREET.X — Services & Tools'
    });
});

// Contact
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'ISHPREET.X | CONTACT'
    });
});

// ==========================
// 404 Page (KEEP THIS LAST)
// ==========================

app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// ==========================
// Start Server
// ==========================

app.listen(PORT, () => {
    console.log(
        `\x1b[32m[SERVER RUNNING]\x1b[0m Portfolio running at http://localhost:${PORT}`
    );
});