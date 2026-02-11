/**
 * Script to create test students with overdue books and fines
 * Run this independently after the server is running to add demo data
 */

const mongoose = require('mongoose');
const dayjs = require('dayjs');

// Connect to database
mongoose.connect('mongodb+srv://admin:piyush93302@cluster0.min2wuc.mongodb.net/students')
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Connection error:', err));

// Define schemas
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    isbn: String,
    category: String,
    section: { type: String, default: 'General' },
    edition: { type: String, default: '1st Edition' },
    totalCopies: Number,
    availableCopies: Number,
    coverImage: String
});

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
const Books = mongoose.model('Books', bookSchema);

async function createTestStudents() {
    try {
        // Check for existing books
        let books = await Books.find();

        if (books.length < 10) {
            console.log('Creates sample books with sections and editions...');
            const sampleBooks = [
                { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Engineering', section: 'Computer Science', edition: '3rd Edition', totalCopies: 5, availableCopies: 5, isbn: '978-0262033848' },
                { title: 'Clean Code', author: 'Robert C. Martin', category: 'Engineering', section: 'Software Engineering', edition: '1st Edition', totalCopies: 3, availableCopies: 3, isbn: '978-0132350884' },
                { title: 'The Pragmatic Programmer', author: 'Andy Hunt', category: 'Engineering', section: 'Software Engineering', edition: '20th Anniversary', totalCopies: 4, availableCopies: 4, isbn: '978-0135957059' },
                { title: 'Design Patterns', author: 'Erich Gamma', category: 'Engineering', section: 'Software Engineering', edition: '1st Edition', totalCopies: 2, availableCopies: 2, isbn: '978-0201633610' },
                { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', category: 'Engineering', section: 'Computer Science', edition: '4th Edition', totalCopies: 6, availableCopies: 6, isbn: '978-0133591620' },
                { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Engineering', section: 'Computer Science', edition: '5th Edition', totalCopies: 5, availableCopies: 5, isbn: '978-0132126953' },
                { title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Engineering', section: 'Database Systems', edition: '7th Edition', totalCopies: 8, availableCopies: 8, isbn: '978-0078022159' },
                { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', category: 'Engineering', section: 'AI & ML', edition: '4th Edition', totalCopies: 4, availableCopies: 4, isbn: '978-0134610993' },
                { title: 'Deep Learning', author: 'Ian Goodfellow', category: 'Engineering', section: 'AI & ML', edition: '1st Edition', totalCopies: 3, availableCopies: 3, isbn: '978-0262035613' },
                { title: 'Digital Logic and Computer Design', author: 'M. Morris Mano', category: 'Engineering', section: 'Electronics', edition: '1st Edition', totalCopies: 10, availableCopies: 10, isbn: '978-0132145107' }
            ];

            await Books.insertMany(sampleBooks);
            console.log('Added 10 sample books.');
            books = await Books.find().limit(10);
        }

        // Calculate overdue dates (books issued 20-30 days ago)
        const calculateFine = (daysOverdue) => {
            return daysOverdue > 0 ? daysOverdue * 2 : 0; // Rs. 2/day
        };

        // Student 1: Piyush (24E120A13)
        const student1 = {
            name: 'Piyush',
            regno: '24E120A13',
            password: 'Piyush',
            role: 'student',
            email: 'piyush@soa.ac.in',
            booksIssued: [
                {
                    bookId: books[0]._id,
                    bookTitle: books[0].title,
                    issueDate: dayjs().subtract(30, 'days').toDate(),
                    dueDate: dayjs().subtract(16, 'days').toDate(), // 14 days overdue
                    returnDate: null,
                    fine: calculateFine(14), // 14 * 2 = Rs. 28
                    status: 'Issued',
                    finePaid: false
                },
                {
                    bookId: books[1]._id,
                    bookTitle: books[1].title,
                    issueDate: dayjs().subtract(25, 'days').toDate(),
                    dueDate: dayjs().subtract(11, 'days').toDate(), // 11 days overdue
                    returnDate: null,
                    fine: calculateFine(11), // 11 * 2 = Rs. 22
                    status: 'Issued',
                    finePaid: false
                }
            ]
        };

        // Student 2: Student (25111a11)
        const student2 = {
            name: 'Student Demo',
            regno: '25E111A11',
            password: 'student',
            role: 'student',
            email: 'student@soa.ac.in',
            booksIssued: [
                {
                    bookId: books[2]._id,
                    bookTitle: books[2].title,
                    issueDate: dayjs().subtract(28, 'days').toDate(),
                    dueDate: dayjs().subtract(14, 'days').toDate(), // 14 days overdue
                    returnDate: null,
                    fine: calculateFine(14), // 14 * 2 = Rs. 28
                    status: 'Issued',
                    finePaid: false
                },
                {
                    bookId: books[3]._id,
                    bookTitle: books[3].title,
                    issueDate: dayjs().subtract(20, 'days').toDate(),
                    dueDate: dayjs().subtract(6, 'days').toDate(), // 6 days overdue
                    returnDate: null,
                    fine: calculateFine(6), // 6 * 2 = Rs. 12
                    status: 'Issued',
                    finePaid: false
                },
                {
                    bookId: books[4]._id,
                    bookTitle: books[4].title,
                    issueDate: dayjs().subtract(22, 'days').toDate(),
                    dueDate: dayjs().subtract(8, 'days').toDate(), // 8 days overdue
                    returnDate: null,
                    fine: calculateFine(8), // 8 * 2 = Rs. 16
                    status: 'Issued',
                    finePaid: false
                }
            ]
        };

        // Student 3: Sania (24E118A98)
        const student3 = {
            name: 'Sania',
            regno: '24E118A98',
            password: 'sania',
            role: 'student',
            email: 'sania@soa.ac.in',
            booksIssued: [
                {
                    bookId: books[5]._id,
                    bookTitle: books[5].title,
                    issueDate: dayjs().subtract(35, 'days').toDate(),
                    dueDate: dayjs().subtract(21, 'days').toDate(), // 21 days overdue
                    returnDate: null,
                    fine: calculateFine(21), // 21 * 2 = Rs. 42
                    status: 'Issued',
                    finePaid: false
                },
                {
                    bookId: books[6]._id,
                    bookTitle: books[6].title,
                    issueDate: dayjs().subtract(18, 'days').toDate(),
                    dueDate: dayjs().subtract(4, 'days').toDate(), // 4 days overdue
                    returnDate: null,
                    fine: calculateFine(4), // 4 * 2 = Rs. 8
                    status: 'Issued',
                    finePaid: false
                }
            ]
        };

        // Create or update students
        for (const studentData of [student1, student2, student3]) {
            const existing = await Users.findOne({ regno: studentData.regno });

            if (existing) {
                console.log(`Updating existing student: ${studentData.name} (${studentData.regno})`);
                await Users.updateOne(
                    { regno: studentData.regno },
                    { $set: studentData }
                );
            } else {
                console.log(`Creating new student: ${studentData.name} (${studentData.regno})`);
                await Users.create(studentData);
            }

            // Update book availability
            for (const book of studentData.booksIssued) {
                if (book.status === 'Issued') {
                    await Books.updateOne(
                        { _id: book.bookId },
                        { $inc: { availableCopies: -1 } }
                    );
                }
            }
        }

        console.log('\n=== Test Students Created Successfully ===');
        console.log('\n1. Piyush (24E120A13) - Password: Piyush');
        console.log('   - 2 books issued');
        console.log('   - Total fine: Rs. 50 (14 days + 11 days overdue)');
        console.log('\n2. Student Demo (25111a11) - Password: student');
        console.log('   - 3 books issued');
        console.log('   - Total fine: Rs. 56 (14 + 6 + 8 days overdue)');
        console.log('\n3. Sania (24E118A98) - Password: sania');
        console.log('   - 2 books issued');
        console.log('   - Total fine: Rs. 50 (21 + 4 days overdue)');
        console.log('\n=======================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error creating test students:', error);
        process.exit(1);
    }
}

createTestStudents();
