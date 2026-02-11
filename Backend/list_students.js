const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:piyush93302@cluster0.min2wuc.mongodb.net/students')
    .then(async () => {
        const userSchema = new mongoose.Schema({
            name: String,
            regno: String,
            password: String,
            role: String
        });
        const Users = mongoose.model('Users', userSchema);
        const user = await Users.findOne({ regno: '25E111A11' });
        if (user) {
            console.log(`FOUND: REGNO: [${user.regno}], PASSWORD: [${user.password}], NAME: [${user.name}]`);
        } else {
            console.log('NOT FOUND: 25E111A11');
            const allStudents = await Users.find({ role: 'student' });
            console.log(`Checking all students... Total: ${allStudents.length}`);
            allStudents.slice(0, 5).forEach(s => console.log(`- ${s.regno}`));
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
