const axios = require('axios');

async function registerStudent() {
    try {
        const studentData = {
            name: "Siddhant",
            regno: "24E110A78",
            email: "siddhant@example.com",
            password: "siddhant"
        };

        const response = await axios.post('http://localhost:3000/api/students', studentData);
        console.log("Registration Successful:", response.data);

    } catch (error) {
        if (error.response) {
            console.error("Registration Failed:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

registerStudent();
