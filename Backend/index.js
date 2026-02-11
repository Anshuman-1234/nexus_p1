const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const dayjs = require('dayjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = 3000;

// Catch unhandled rejections and exceptions to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Give time to log before exit
    setTimeout(() => process.exit(1), 1000);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- Database Connection ---
mongoose.connect('mongodb+srv://admin:piyush93302@cluster0.min2wuc.mongodb.net/students')
    .then(() => console.log('Mongoose connection successful'))
    .catch(err => console.error('Mongoose connection error:', err));

// --- Schemas & Models ---
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    isbn: String,
    category: String,
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

// --- Email Config ---
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}`, error);
    }
};

// --- Razorpay Config ---
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// --- Static Files ---
app.use(express.static(path.join(__dirname, '../Frontend')));

// --- Middlewares ---
// Simple mock auth middleware could be added, but relying on frontend sending data for now

// --- Routes ---

// Login
app.post('/login', async (req, res) => {
    try {
        const { role, regNo, password, librarianPassword, adminPassword } = req.body;
        let user = null;

        if (role === 'student') {
            user = await Users.findOne({ role: 'student', regno: regNo, password });
            if (!user) return res.status(401).json({ error: 'Invalid student credentials' });
        } else if (role === 'librarian') {
            if (librarianPassword !== "1") return res.status(401).json({ error: 'Invalid librarian credentials' });
            // For librarian, we might just return a mock user or check a DB record if one exists
            user = { role: 'librarian', name: 'Librarian', regno: 'LIB001' };
        } else if (role === 'admin') {
            if (adminPassword !== "1") return res.status(401).json({ error: 'Invalid admin credentials' });
            user = { role: 'admin', name: 'Admin', regno: 'ADM001' };
        } else {
            return res.status(400).json({ error: 'Invalid role' });
        }

        console.log('Login successful:', user);
        res.json({ success: true, user: { name: user.name, role: user.role, regno: user.regno } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Profile (Student)
app.get('/api/student/:regno', async (req, res) => {
    try {
        const user = await Users.findOne({ regno: req.params.regno });
        if (!user) return res.status(404).json({ error: 'User not found' });

        let totalFine = 0;
        const today = dayjs();

        if (user.booksIssued) {
            user.booksIssued.forEach(book => {
                try {
                    if (book.status === 'Issued') {
                        const due = dayjs(book.dueDate);
                        if (today.isAfter(due)) {
                            const diff = today.diff(due, 'day');
                            book.fine = diff * 2;
                        }
                    }
                    if (!book.finePaid) {
                        totalFine += (book.fine || 0);
                    }
                } catch (e) {
                    console.error("Error calculating fine for book:", book.bookTitle, e);
                }
            });
            await user.save();
        }
        res.json({ user, totalFine });
    } catch (err) {
        console.error("Error fetching student profile:", err);
        res.status(500).json({ error: err.message });
    }
});

// Dashboard Stats (Librarian/Admin)
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const studentCount = await Users.countDocuments({ role: 'student' });
        const bookCount = await Books.countDocuments();

        // Count total active issued books across all users
        // This is expensive in this schema structure, but okay for small scale
        const users = await Users.find({ role: 'student' });
        let activeIssues = 0;
        users.forEach(u => {
            activeIssues += u.booksIssued.filter(b => b.status === 'Issued').length;
        });

        res.json({ studentCount, bookCount, activeIssues });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Books (Explore)
app.get('/api/books', async (req, res) => {
    try {
        const books = await Books.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Students (Librarian/Admin)
app.get('/api/all-students', async (req, res) => {
    try {
        const students = await Users.find({ role: 'student' });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Student (Librarian/Admin)
app.post('/api/students', async (req, res) => {
    try {
        const { name, regno, email, password } = req.body;

        const existing = await Users.findOne({ regno });
        if (existing) return res.status(400).json({ error: 'Student with this RegNo already exists' });

        const newUser = new Users({
            name,
            regno,
            email,
            password, // In a real app, hash this!
            role: 'student',
            booksIssued: []
        });

        await newUser.save();
        res.json({ success: true, message: 'Student registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Student (Librarian/Admin)
app.delete('/api/students/:regno', async (req, res) => {
    try {
        const { regno } = req.params;
        const student = await Users.findOne({ regno, role: 'student' });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Remove student
        await Users.findOneAndDelete({ regno, role: 'student' });
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Student (Librarian/Admin)
app.put('/api/students/:regno', async (req, res) => {
    try {
        const { regno } = req.params;
        const { name, email, password, newRegno } = req.body;

        // If changing regno, check if newRegno already taken
        if (newRegno && newRegno !== regno) {
            const exists = await Users.findOne({ regno: newRegno });
            if (exists) return res.status(400).json({ error: 'New Registration Number is already taken' });
        }

        const student = await Users.findOneAndUpdate(
            { regno, role: 'student' },
            { name, email, password, regno: newRegno || regno },
            { new: true }
        );

        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, message: 'Student updated successfully', student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Book (Librarian/Admin)
app.post('/api/books', async (req, res) => {
    try {
        const { title, author, isbn, category, totalCopies, coverImage } = req.body;

        const newBook = new Books({
            title,
            author,
            isbn,
            category,
            totalCopies: Number(totalCopies),
            availableCopies: Number(totalCopies),
            coverImage
        });

        await newBook.save();
        res.json({ success: true, message: 'Book added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Book (Librarian/Admin)
app.delete('/api/books/:id', async (req, res) => {
    try {
        await Books.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Issue Book (Librarian)
app.post('/api/issue', async (req, res) => {
    try {
        const { regno, bookId, customDueDate } = req.body;

        const user = await Users.findOne({ regno });
        if (!user) return res.status(404).json({ error: 'Student not found' });

        // Check if student has unpaid fines or overdue books
        const hasUnpaidFines = user.booksIssued.some(b => b.fine > 0 && !b.finePaid);
        if (hasUnpaidFines) {
            return res.status(400).json({ error: 'Student has unpaid fines. Cannot issue new book.' });
        }

        const book = await Books.findById(bookId);
        if (!book || book.availableCopies < 1) {
            return res.status(400).json({ error: 'Book not available' });
        }

        const issueDate = new Date();
        // Use customDueDate if provided, else default to 14 days
        const dueDate = customDueDate ? new Date(customDueDate) : dayjs().add(14, 'day').toDate();

        user.booksIssued.push({
            bookId: book._id,
            bookTitle: book.title,
            issueDate,
            dueDate,
            fine: 0,
            status: 'Issued',
            finePaid: false
        });

        book.availableCopies -= 1;
        await book.save();
        await user.save();

        // Send Email
        const emailText = `Dear ${user.name},

This email serves as an official confirmation that the book titled "${book.title}" has been successfully issued to you.

The due date for returning the book is ${dayjs(dueDate).format('DD MMM YYYY')}.

You are requested to ensure that the book is returned on or before the specified due date. Failure to do so may result in late return charges as per library policy.

For any further clarification or assistance, please contact the library administration.

Sincerely,  
Library Administration`;

        if (user.email) sendEmail(user.email, "Book Issued - SOA Library", emailText);

        res.json({ success: true, message: 'Book issued successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Return Book (Librarian)
app.post('/api/return', async (req, res) => {
    try {
        const { regno, bookIssueId } = req.body;
        const user = await Users.findOne({ regno });
        if (!user) return res.status(404).json({ error: 'Student not found' });

        const issuedBook = user.booksIssued.id(bookIssueId);
        if (!issuedBook) return res.status(404).json({ error: 'Issue record not found' });

        issuedBook.status = 'Returned';
        issuedBook.returnDate = new Date();

        // Finalize fine calculation
        const due = dayjs(issuedBook.dueDate);
        const returned = dayjs(issuedBook.returnDate);
        if (returned.isAfter(due)) {
            const diff = returned.diff(due, 'day');
            issuedBook.fine = diff * 2; // Updated: 2 Rs per day fine
        }

        const book = await Books.findById(issuedBook.bookId);
        if (book) {
            // Only increment available copies if there is NO fine.
            // If there IS a fine, we wait for payment before restoring stock.
            if (issuedBook.fine <= 0) {
                book.availableCopies += 1;
                await book.save();
            }
        }

        await user.save();
        res.json({ success: true, message: 'Book returned', fine: issuedBook.fine });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Payment Order (Student)
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // amount in paise
            currency: "INR",
            receipt: "receipt_" + Date.now()
        };
        const order = await razorpay.orders.create(options);
        console.log(`Razorpay Order Created: ${order.id} for amount: ${order.amount}`);
        res.json(order);
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment (Student)
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, regno } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            console.log("Payment signature verified successfully");
            // Update user fines and mark books as returned if they were still issued
            const user = await Users.findOne({ regno });
            if (user) {
                let totalPaid = 0;
                for (const b of user.booksIssued) {
                    if (b.fine > 0 && !b.finePaid) {
                        totalPaid += b.fine;
                        b.finePaid = true;

                        // Increment stock because it wasn't incremented during 'Return' (due to fine)
                        // or because it's being auto-returned now.
                        const book = await Books.findById(b.bookId);
                        if (book) {
                            book.availableCopies += 1;
                            await book.save();
                        }

                        if (b.status === 'Issued') {
                            b.status = 'Returned';
                            b.returnDate = new Date();
                        }
                    }
                }

                await user.save();

                // Send Confirmation Email
                if (user.email && totalPaid > 0) {
                    sendEmail(
                        user.email,
                        "Fine Payment Confirmation",
                        `Dear ${user.name},

This is to formally confirm that your fine payment of ₹${totalPaid} has been successfully received and processed.

Your library account has been updated accordingly, and the related book records have been adjusted.

If you require a receipt or any further clarification, please contact the library administration.

Sincerely,  
Library Administration`
                    );

                }
            }
            res.json({ success: true });
        } else {
            console.error("Signature verification failed. Expected:", expectedSignature, "Received:", razorpay_signature);
            res.status(400).json({ success: false, error: 'Invalid signature' });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Cron Job for Reminders ---
cron.schedule("*/10 * * * *", async () => { // Check every 10 minutes to avoid resource flooding
    try {
        console.log("Checking for overdue books...");
        const users = await Users.find({ "booksIssued.status": "Issued" });
        const today = dayjs();

        for (const user of users) {
            let updated = false;
            for (const book of user.booksIssued) {
                if (book.status !== 'Issued') continue;

                const due = dayjs(book.dueDate);

                // Immediate Overdue Trigger (Once)
                if (today.isAfter(due) && !book.overdueEmailSent) {
                    if (user.email) {
                        await sendEmail(
                            user.email,
                            "Book Overdue Notice",
                            `Dear ${user.name},

This is to formally inform you that the book titled "${book.bookTitle}" is currently overdue.

Original Due Date: ${due.format('DD MMM YYYY')}

You are requested to return the book to the library at the earliest to prevent further accumulation of overdue fines, in accordance with library regulations.

If the book has already been returned, please disregard this notice.

Sincerely,  
Library Administration`
                        );
                        book.overdueEmailSent = true;
                        updated = true;
                    }
                }
            }
            if (updated) await user.save();
        }
    } catch (err) {
        console.error("Cron Error (Overdue Check):", err);
    }
});


// 404 Handler for API
app.use('/api', (req, res) => {
    console.log(`404 API - ${req.method} ${req.url}`);
    res.status(404).json({ error: 'API route not found' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
