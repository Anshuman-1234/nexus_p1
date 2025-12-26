const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3000
const app = express()
app.use(express.static(__dirname))
app.use(express.urlencoded({ extened: true }))

mongoose.connect('mongodb://127.0.0.1:27017/students')
const db = mongoose.connection
db.once('open', () => {
    console.log('Mongoose conncetion successful');
})

const userSchema = new mongoose.Schema({
    name: String,
    regno: String,
    password: String
})
const Users = mongoose.model('data', userSchema)

app.post('/post', async (req, res) => {
    let { name, regno, password } = req.body
    const user = new Users({
        name: name,
        regno: regno,
        password: password
    })
    await user.save()
    console.log(user)
    res.redirect('dashboard.html')
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});
app.listen(port, () => {
    console.log('running on port : ', port);
})