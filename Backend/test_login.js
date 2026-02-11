const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:3000/login', {
            role: 'student',
            regNo: '25E111A11',
            password: 'student'
        });
        console.log('Login Test Success:', response.data);
    } catch (error) {
        console.error('Login Test Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
