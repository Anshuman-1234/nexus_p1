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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
    .then(() => {
        const dbName = mongoose.connection.name;
        console.log(`Mongoose connected to database: ${dbName}`);
    })
    .catch(err => {
        console.error('Mongoose connection error:', err);
        console.error('\n\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Could not connect to MongoDB Atlas.');
        console.error('\nPossible causes:');
        console.error('1. IP Address not whitelisted in MongoDB Atlas (Most likely cause).');
        console.error('2. Incorrect MONGO_URI in .env file.');
        console.error('3. Network firewall blocking port 27017.');
        console.error('\nTo Fix: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Add Current IP Address.\n');
    });

// --- Schemas & Models ---
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
    profilePic: String,
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

const sendEmail = async (to, subject, text, html = null) => {
    try {
        const mailOptions = {
            from: `"SOA Library" <${process.env.EMAIL_ADDRESS}>`,
            to,
            subject,
            text,
            html: html || `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #fca311; margin: 0; font-size: 28px; letter-spacing: 1px;">SIKSHA 'O' ANUSANDHAN</h1>
                        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">University Library Portal</p>
                    </div>
                    <div style="padding: 40px; color: #334155; line-height: 1.6;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">${subject}</h2>
                        <p style="margin-top: 20px; font-size: 16px;">Dear User,</p>
                        <p style="font-size: 16px; color: #475569;">${text.replace(/\n/g, '<br>')}</p>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #94a3b8; text-align: center;">
                            <p style="margin: 0;">&copy; 2025 Siksha 'O' Anusandhan. All rights reserved.</p>
                            <p style="margin: 5px 0 0 0;">Institute of Technical Education and Research, Bhubaneswar</p>
                        </div>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
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
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

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
            // Check DB first
            user = await Users.findOne({ role: 'librarian', regno: regNo || 'LIB001', password: password || librarianPassword });

            // Fallback to hardcoded if DB is empty and password matches
            if (!user && (librarianPassword === "@iter" || password === "@iter")) {
                user = { role: 'librarian', name: 'Librarian', regno: 'LIB001', password: "@iter" };
                // Optionally save to DB if it doesn't exist
                const exists = await Users.findOne({ role: 'librarian' });
                if (!exists) {
                    const newLib = new Users(user);
                    await newLib.save();
                }
            }
            if (!user) return res.status(401).json({ error: 'Invalid librarian credentials' });
        } else if (role === 'admin') {
            user = await Users.findOne({ role: 'admin', regno: regNo || 'ADM001', password: password || adminPassword });
            if (!user && (adminPassword === "@iter" || password === "@iter")) {
                user = { role: 'admin', name: 'Admin', regno: 'ADM001', password: "@iter" };
                const exists = await Users.findOne({ role: 'admin' });
                if (!exists) {
                    const newAdmin = new Users(user);
                    await newAdmin.save();
                }
            }
            if (!user) return res.status(401).json({ error: 'Invalid admin credentials' });
        } else {
            return res.status(400).json({ error: 'Invalid role' });
        }

        console.log('Login successful:', user);
        res.json({ success: true, user: { name: user.name, role: user.role, regno: user.regno, email: user.email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile (Any Role)
app.put('/api/profile/update', async (req, res) => {
    try {
        const { regno, name, email, password } = req.body;
        const user = await Users.findOne({ regno });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', user: { name: user.name, role: user.role, regno: user.regno, email: user.email } });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ error: err.message });
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

// Get All Overdue Books (Librarian/Admin)
app.get('/api/overdue-books', async (req, res) => {
    try {
        const users = await Users.find({ "booksIssued.status": "Issued" });
        const overdueList = [];
        const today = dayjs();

        users.forEach(user => {
            user.booksIssued.forEach(book => {
                if (book.status === 'Issued') {
                    const due = dayjs(book.dueDate);
                    if (today.isAfter(due)) {
                        overdueList.push({
                            userName: user.name,
                            userRegno: user.regno,
                            userEmail: user.email,
                            bookTitle: book.bookTitle,
                            dueDate: book.dueDate,
                            fine: today.diff(due, 'day') * 2
                        });
                    }
                }
            });
        });
        res.json(overdueList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Manual Notice (Librarian/Admin)
app.post('/api/send-notice', async (req, res) => {
    try {
        const { regno, bookTitle, dueDate, fine, email } = req.body;

        if (!email) return res.status(400).json({ error: 'Student email is required' });

        const emailText = `Dear Student,

This is a formal notice regarding your overdue book: "${bookTitle}".
        
Due Date: ${dayjs(dueDate).format('DD MMM YYYY')}
Current Accumulated Fine: ₹${fine}

Please return the book to the library at the earliest to avoid further fines.

Sincerely,
Library Administration`;

        await sendEmail(email, "Overdue Book Notice - SOA Library", emailText);

        res.json({ success: true, message: 'Notice sent successfully' });
    } catch (err) {
        console.error("Error sending manual notice:", err);
        res.status(500).json({ error: err.message });
    }
});
// Admin Analytics (Librarian/Admin)
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const users = await Users.find({ role: 'student' });
        const books = await Books.find();

        // 1. Category Distribution
        const categoryMap = {};
        books.forEach(b => {
            categoryMap[b.category] = (categoryMap[b.category] || 0) + 1;
        });
        const categoryData = Object.keys(categoryMap).map(name => ({ name, value: categoryMap[name] }));

        // 2. Financial Health
        let totalPaid = 0;
        let totalPending = 0;
        users.forEach(u => {
            u.booksIssued.forEach(b => {
                if (b.fine > 0) {
                    if (b.finePaid) totalPaid += b.fine;
                    else totalPending += b.fine;
                }
            });
        });
        const financialData = [
            { name: 'Paid', value: totalPaid },
            { name: 'Pending', value: totalPending }
        ];

        // 3. Activity Trend (Last 7 Days)
        const activityTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = dayjs().subtract(i, 'day').format('DD MMM');
            activityTrend.push({ date, issues: 0, returns: 0 });
        }

        users.forEach(u => {
            u.booksIssued.forEach(b => {
                const issueDate = dayjs(b.issueDate).format('DD MMM');
                const returnDate = b.returnDate ? dayjs(b.returnDate).format('DD MMM') : null;

                const issueIdx = activityTrend.findIndex(a => a.date === issueDate);
                if (issueIdx !== -1) activityTrend[issueIdx].issues++;

                if (returnDate) {
                    const returnIdx = activityTrend.findIndex(a => a.date === returnDate);
                    if (returnIdx !== -1) activityTrend[returnIdx].returns++;
                }
            });
        });

        res.json({ categoryData, financialData, activityTrend });
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
            password,
            role: 'student',
            booksIssued: []
        });

        await newUser.save();

        // Send Welcome Email
        if (email) {
            const welcomeText = `Welcome to SOA Library Portal!
            
We are pleased to inform you that your library account has been successfully created. You can now access our extensive collection of digital and physical resources.

Log in using your Registration Number (${regno}) and the password provided during registration.

We wish you a productive academic journey!`;

            sendEmail(email, "Welcome to SOA Library!", welcomeText);
        }

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

// Update Student Profile (Self)
app.put('/api/student/profile/:regno', async (req, res) => {
    try {
        const { regno } = req.params;
        const { name, email, profilePic } = req.body;

        const user = await Users.findOneAndUpdate(
            { regno, role: 'student' },
            { name, email, profilePic },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change Password (Student)
app.put('/api/student/change-password/:regno', async (req, res) => {
    try {
        const { regno } = req.params;
        const { prevPassword, newPassword } = req.body;

        const user = await Users.findOne({ regno, role: 'student' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.password !== prevPassword) {
            return res.status(400).json({ error: 'Incorrect previous password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Book (Librarian/Admin)
app.post('/api/books', async (req, res) => {
    try {
        const { title, author, isbn, category, section, edition, totalCopies, coverImage } = req.body;

        const newBook = new Books({
            title,
            author,
            isbn,
            category,
            section: section || 'General',
            edition: edition || '1st Edition',
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

// Issue Book (Librarian)
app.post('/api/issue', async (req, res) => {
    try {
        const { regno, bookId, customDueDate } = req.body;
        const user = await Users.findOne({ regno });
        if (!user) return res.status(404).json({ error: 'Student not found' });

        // Check if student has unpaid fines
        const hasUnpaidFines = user.booksIssued.some(b => b.fine > 0 && !b.finePaid);
        if (hasUnpaidFines) {
            return res.status(400).json({ error: 'Student has unpaid fines. Cannot issue new book.' });
        }

        const book = await Books.findById(bookId);
        if (!book || book.availableCopies < 1) {
            return res.status(400).json({ error: 'Book not available' });
        }

        const issueDate = new Date();
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
        const emailText = `A new book has been issued to your account.
        
Book Title: ${book.title}
Due Date: ${dayjs(dueDate).format('DD MMM YYYY')}

Please ensure the book is returned on or before the due date to avoid late charges.`;

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
        // Return order details along with the public key id so frontend can initialize checkout
        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
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


// Generate Reports (Librarian/Admin)
app.get('/api/reports/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { jsPDF } = require('jspdf');
        const autoTable = require('jspdf-autotable');
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // Navy
        doc.text("SIKSHA 'O' ANUSANDHAN", 105, 15, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(243, 156, 18); // Gold
        doc.text(`Library Report: ${type.toUpperCase()}`, 105, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 32, { align: 'center' });

        if (type === 'books') {
            const books = await Books.find();
            const data = books.map(b => [b.title, b.author, b.category, b.availableCopies + "/" + b.totalCopies]);
            autoTable.default(doc, {
                startY: 40,
                head: [['Title', 'Author', 'Category', 'Stock']],
                body: data,
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [241, 245, 249] }
            });
        } else if (type === 'students') {
            const students = await Users.find({ role: 'student' });
            const data = students.map(s => [s.name, s.regno, s.email, s.booksIssued.filter(b => b.status === 'Issued').length]);
            autoTable.default(doc, {
                startY: 40,
                head: [['Name', 'Reg No', 'Email', 'Active Issues']],
                body: data,
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [241, 245, 249] }
            });
        } else if (type === 'overdue') {
            const users = await Users.find({ "booksIssued.status": "Issued" });
            const data = [];
            const today = dayjs();
            users.forEach(u => {
                u.booksIssued.forEach(b => {
                    if (b.status === 'Issued' && today.isAfter(dayjs(b.dueDate))) {
                        data.push([u.name, b.bookTitle, dayjs(b.dueDate).format('DD MMM YYYY'), today.diff(dayjs(b.dueDate), 'day') * 2]);
                    }
                });
            });
            autoTable.default(doc, {
                startY: 40,
                head: [['Student', 'Book', 'Due Date', 'Fine (₹)']],
                body: data,
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [241, 245, 249] }
            });
        } else if (type === 'transactions') {
            const users = await Users.find({ role: 'student' });
            const data = [];
            users.forEach(u => {
                u.booksIssued.forEach(b => {
                    if (b.finePaid && b.fine > 0) {
                        data.push([u.name, b.bookTitle, b.fine, b.returnDate ? dayjs(b.returnDate).format('DD MMM YYYY') : 'Paid']);
                    }
                });
            });
            autoTable.default(doc, {
                startY: 40,
                head: [['Student', 'Book', 'Amount (₹)', 'Paid Date']],
                body: data,
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [241, 245, 249] }
            });
        } else if (type === 'student_history') {
            const { regno } = req.query;
            const student = await Users.findOne({ regno, role: 'student' });
            if (!student) return res.status(404).send('Student not found');

            doc.text(`Student: ${student.name} (${student.regno})`, 14, 40);

            const data = student.booksIssued.map(b => [
                b.bookTitle,
                dayjs(b.issueDate).format('DD MMM YYYY'),
                b.status,
                b.returnDate ? dayjs(b.returnDate).format('DD MMM YYYY') : '-',
                `₹${b.fine || 0}`
            ]);

            autoTable.default(doc, {
                startY: 50,
                head: [['Book Title', 'Issue Date', 'Status', 'Return Date', 'Fine']],
                body: data,
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [241, 245, 249] }
            });
        }

        const buffer = doc.output('arraybuffer');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=SOA_Library_${type}_Report.pdf`);
        res.send(Buffer.from(buffer));

    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 404 Handler for API
app.use('/api', (req, res) => {
    console.log(`404 API - ${req.method} ${req.url}`);
    res.status(404).json({ error: 'API route not found' });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
