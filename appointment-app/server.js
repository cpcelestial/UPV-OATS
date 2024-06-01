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

// helper function to read user data
const readUsers = () => {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
};

// helper function to write user data
const writeUsers = (data) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// basic authentication middleware
const basicAuth = (req, res, next) => {
    const auth = { login: 'admin', password: 'admin' }; // change to your admin credentials

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // verify login and password
    if (login && password && login === auth.login && password === auth.password) {
        // access granted
        return next();
    }

    // access denied
    res.set('WWW-Authenticate', 'Basic realm="401"'); // you can change this message
    res.status(401).send('Authentication required.');
};

// route to handle sign-up
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

// route to handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check for admin credentials
    if (email === 'admin@example.com' && password === 'admin') {
        return res.redirect('/Admin.html');
    }

    const users = readUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        return res.redirect('/Student.html');
    } else {
        res.status(400).send('Invalid credentials');
    }
});

// route to view all users (protected by basic auth)
app.get('/users', basicAuth, (req, res) => {
    const users = readUsers();
    res.json(users);
});

// route to handle password update
app.post('/update-password', (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    console.log(`Email: ${email}, Current Password: ${currentPassword}, New Password: ${newPassword}`);
    
    const users = readUsers();
    const user = users.find(user => user.email === email && user.password === currentPassword);

    if (!user) {
        console.log('Current password is incorrect');
        return res.status(400).send('Current password is incorrect');
    }

    user.password = newPassword;
    writeUsers(users);
    res.send('Password updated successfully');
});

// Add this route to handle account deletion
app.post('/delete-account', (req, res) => {
    const { email, password } = req.body;
    console.log(`Delete request for email: ${email}, password: ${password}`);

    const users = readUsers();
    const userIndex = users.findIndex(user => user.email === email && user.password === password);

    if (userIndex === -1) {
        console.log('Password is incorrect or user does not exist');
        return res.status(400).send('Password is incorrect or user does not exist');
    }

    users.splice(userIndex, 1);
    writeUsers(users);
    res.send('Account deleted successfully');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
