# SOA Library Management System 📚

A comprehensive, full-stack library management solution built for **Siksha 'O' Anusandhan (SOA) University**. This platform facilitates seamless book tracking, student management, overdue monitoring, and fine processing with a modern, high-performance UI.

## 🚀 Key Features

### 👤 Student Dashboard
*   **Book Discovery**: Search and browse the entire library collection.
*   **Personal Tracking**: Monitor currently issued books and view return history.
*   **Fine Management**: Integrated **Razorpay** gateway for instant fine payments.
*   **Customization**: 6+ premium color themes (Royal Blue, Vibrant Purple, Emerald Green, etc.).
*   **Profile Settings**: Manage email, password, and profile picture (Avatar support).
*   **Personalized Reports**: Download a complete PDF history of your library activity.

### 🛡️ Librarian Console
*   **Issue/Return System**: Simplified workflow for managing books for students.
*   **Overdue Monitor**: Real-time tracking of late returns with automated and manual notice systems.
*   **Notice System**: Send formal email notifications to students directly from the dashboard.
*   **Stat Insights**: Quick view of active issues, total students, and collection health.

### ⚙️ Admin Console
*   **Inventory Management**: Add, update, and remove books from the system.
*   **Student Directory**: Complete control over student accounts and registration details.
*   **Advanced Analytics**: Visual insights into circulation trends, category distribution, and financial health (fines collected vs. pending).
*   **Global Exports**: Export the entire book catalog or student list as professional PDF reports.

## 🛠️ Technology Stack

*   **Frontend**: React.js, Tailwind CSS, Lucide React, Framer Motion, Recharts.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB Atlas (Mongoose).
*   **Payments**: Razorpay API.
*   **Notifications**: Nodemailer (Gmail SMTP).
*   **Reporting**: jsPDF & AutoTable.
*   **Date Handling**: Day.js.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account
*   Razorpay API Keys
*   Gmail App Password (for notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/Anshuman-1234/nexus_p1.git
cd nexus_p1
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root (soa/) directory (use the structure below):
   ```env
   MONGO_URI=your_mongodb_uri
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   EMAIL_ADDRESS=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build for production (optional):
   ```bash
   npm run build
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🌐 Vercel Deployment

This project is optimized for deployment on **Vercel** as a full-stack monorepo.

### Deployment Steps
1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. In **Project Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `Frontend/dist`
4. Add the following **Environment Variables**:
   - `MONGO_URI`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `EMAIL_ADDRESS`
   - `EMAIL_PASSWORD`
   - `VERCEL=true` (Required)

### ⚠️ Note on Cron Jobs
The built-in `node-cron` in `Backend/index.js` will not run on Vercel because serverless functions are execution-limited. To enable automatic overdue notices, use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) to ping your `/api/overdue-books` endpoint daily.

## 📄 License
This project is developed for Siksha 'O' Anusandhan. All rights reserved.

---
Developed with ❤️ by Nexus-E4
---
Technical Contributors:
1) Anshuman Barik (Backend Developer)
2) Piyush Tiwari  (Backend Developer)
3) Siddhant Jena  (Frontend Developer)

****Related URL :
*Vercel Deployment URL of SOA Library Information Management System:
https://nexus-p1.vercel.app/
*APK URL of SOA Library Information Management System:
https://drive.google.com/file/d/1t7QJjU9M83p6iYZgev2vf_CHcU5jNOJi/view?usp=drivesdk