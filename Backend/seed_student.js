const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://admin:piyush93302@cluster0.min2wuc.mongodb.net/students';

const userSchema = new mongoose.Schema({
    name: String,
    regno: { type: String, unique: true },
    password: String,
    role: String,
    email: String,
    booksIssued: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Books' },
        bookTitle: String,
        issueDate: Date,
        dueDate: Date,
        returnDate: Date,
        fine: { type: Number, default: 0 },
        status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' },
        finePaid: { type: Boolean, default: false },
        overdueEmailSent: { type: Boolean, default: false }
    }]
});

const Users = mongoose.model('Users', userSchema);

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const student = await Users.findOneAndUpdate(
            { regno: '24E110A78' },
            {
                name: 'Siddhant',
                regno: '24E110A78',
                password: 'siddhant',
                role: 'student',
                email: 'siddhant@example.com' // Dummy email
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('Student Created/Updated:', student);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding student:', err);
        process.exit(1);
    }
}

seed();
