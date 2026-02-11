const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:piyush93302@cluster0.min2wuc.mongodb.net/students')
    .then(async () => {
        console.log('Connected to database');
        const userSchema = new mongoose.Schema({
            name: String,
            regno: { type: String, unique: true },
            password: String,
            role: String
        });
        const Users = mongoose.model('Users', userSchema);

        const user = await Users.findOne({ regno: /25E111A11/i });
        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User not found even with case-insensitive search');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
