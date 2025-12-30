const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.once('open', () => console.log('Mongoose connection successful'));


const userSchema = new mongoose.Schema({
    name: String,
    regno: String,
    password: String,
    role: String
});
const Users = mongoose.model('Users', userSchema);


app.use(express.static(path.join(__dirname, '../Frontend')));


app.post('/login', async (req, res) => {
    try {
        const { role, regNo, password, librarianPassword, adminPassword } = req.body;
        let user = null;

        if (role === 'student') {
            user = await Users.findOne({ role: 'student', regno: regNo, password });
            if (!user) return res.status(401).send('Invalid student credentials');
        } else if (role === 'librarian') {
            if (librarianPassword !== "1") return res.status(401).send('Invalid librarian credentials');
            user = { role: 'librarian', name: 'Librarian' };
        } else if (role === 'admin') {
            if (adminPassword !== "1") return res.status(401).send('Invalid admin credentials');
            user = { role: 'admin', name: 'Admin' };
        } else {
            return res.status(400).send('Invalid role');
        }

        console.log('Login successful:', user);

        res.sendFile(path.join(__dirname, '../Frontend/dashboard.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});


app.listen(port, () => console.log(`Server running on port ${port}`));
