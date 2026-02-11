# 📚 SOA Library Information Management System

A premium, full-stack library management platform designed for the **Siksha 'O' Anusandhan (SOA) University**. This system provides a seamless, high-fidelity experience for students, librarians, and administrators to manage academic resources, track circulation, and visualize system analytics.

---

## ✨ Features

### 👨‍🎓 Student Portal
*   **Dynamic Explorer**: Browse the entire library inventory with real-time availability tracking.
*   **Personalized Dashboard**: View currently issued books, due dates, and outstanding fines.
*   **Premium Theme Store**: High-end customization with 10+ curated themes (Nature, Executive, Minimalist) and background styles.
*   **Secure Payments**: Integrated Razorpay gateway for instantaneous fine settlements.
*   **Activity Reports**: Generate and download personal PDF activity summaries.

### 👩‍💼 Librarian Portal
*   **Inventory Management**: Full CRUD operations for books with category-based organization.
*   **Student Administration**: Register and manage student profiles and registration numbers.
*   **Circulation Control**: Process book issuances and returns with one-click automation.
*   **Automated Notices**: System-triggered email notifications for overdue returns using `node-cron`.

### 🛡️ Admin Analytics Dashboard
*   **Deep Intelligence**: Advanced data visualization using Chart.js for category distribution and system utilization.
*   **Trend Analysis**: 7-day circulation activity tracking and popularity rankings.
*   **Financial Monitoring**: Real-time tracking of fine collection progress (Paid vs. Pending).
*   **System Health**: Instant overview of low-stock items and student engagement metrics.

---

## 🚀 Tech Stack

### Frontend
*   **Core**: HTML5, Vanilla JavaScript (ES6+), CSS3 (Modern Flex/Grid).
*   **Design**: Premium Glassmorphism UI, FontAwesome Pro, Google Fonts (Inter).
*   **Visualization**: [Chart.js](https://www.chartjs.org/) for high-performance analytics.
*   **Reporting**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable).
*   **Date Handling**: [Day.js](https://day.js.org/).

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/).
*   **Framework**: [Express.js](https://expressjs.com/) (RESTful API Design).
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM.
*   **Automation**: [node-cron](https://www.npmjs.com/package/node-cron) for scheduled overdue checks.

### Integrations
*   **Payments**: [Razorpay API](https://razorpay.com/docs/payments/dashboard/account-setup/api-keys/).
*   **Communication**: [Nodemailer](https://nodemailer.com/) for transactional email notices.

---

## 📂 Project Structure

```text
Nexus_Auth/
├── Backend/
│   ├── index.js          # Core Express server & API routes
│   └── models/           # Mongoose schemas (Users, Books, etc.)
├── Frontend/
│   ├── index.html        # Authentication & Landing
│   ├── dashboard.html    # Student Portal
│   ├── librarian_dashboard.html
│   └── admin_dashboard.html
├── .env                  # Environment configurations
└── README.md             # You are here
```

---

## 🛠️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/nexushuborg/Nexus-E4.git
    cd Nexus_Auth
    ```

2.  **Server Setup**
    ```bash
    cd Backend
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and add:
    ```env
    MONGO_URI=your_mongodb_connection_string
    RAZORPAY_KEY_ID=your_key_id
    RAZORPAY_KEY_SECRET=your_secret
    EMAIL_ADDRESS=your_library_email@gmail.com
    EMAIL_PASSWORD=your_app_password
    ```

4.  **Run the Application**
    ```bash
    node index.js
    ```
    Access the app at `http://localhost:3000`.

---

## 🔄 System Flow

1.  **Authentication**: Users register/login; roles are determined by system credentials.
2.  **Resource Discovery**: Students search for books → Check availability → Request issue.
3.  **Validation**: The system checks for outstanding fines (>₹50) before allowing new issuances.
4.  **Circulation**: Librarians approve the issue → Stock count decrements → Due date is set (14 days).
5.  **Notifications**: If unreturned, the system sends an automated email check every 10 minutes.
6.  **Analytics**: Admin dashboard pulls aggregated data from MongoDB to generate growth charts.

---

## 📐 Design Philosophy
The UI follows a **Glassmorphic** and **Responsive** philosophy. 
*   **Mobile First**: Dashboards are optimized for all screen sizes using CSS Media Queries.
*   **Visual Feedback**: Subtle micro-animations (Up-fades, Hover scales) guide the user journey.
*   **Accessibility**: High-contrast ratios and semantic HTML ensure a usable experience for everyone.

---
© 2026 SOA University Library Management Team. Built with ❤️ for Advanced Academic Resource Tracking.
