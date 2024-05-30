const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const usersFilePath = path.join(__dirname, 'users.json');

// Helper function to read user data
const readUsers = () => {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
};

// Helper function to write user data
const writeUsers = (data) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// Route to handle sign-up
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    const users = readUsers();

    if (users.find(user => user.email === email)) {
        return res.status(400).send('User already exists');
    }

    users.push({ username, email, password });
    writeUsers(users);
    res.redirect('/Login.html');
});

// Route to handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();

    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        res.redirect('/Student.html');
    } else {
        res.status(400).send('Invalid credentials');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});