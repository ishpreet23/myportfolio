require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use layout.ejs as the default layout
app.use(expressLayouts);
app.set('layout', 'layout');

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to inject default values to template locals
app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('home', {
        title: 'ISHPREET SINGH | Pushing Boundaries'
    });
});

app.get('/work', (req, res) => {
    res.render('work', {
        title: 'ISHPREET.X | WORK GALLERY'
    });
});

app.get('/expertise', (req, res) => {
    res.render('expertise', {
        title: 'ISHPREET.X — Services & Tools'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'ISHPREET.X | CONTACT'
    });
});

// 404 Page
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Start Server
app.listen(PORT, () => {
    console.log(`\x1b[32m[SERVER RUNNING]\x1b[0m Cyber-Luxury Portfolio listening at http://localhost:${PORT}`);
});