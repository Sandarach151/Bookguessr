const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlcon = require("./JS/sqlcon");
const squery = sqlcon.squery;
const multerUpload = require("./JS/multerUpload");
const upload = multerUpload.upload;
const uploadProcess = require("./JS/uploadProcess");
const mergedProcess = uploadProcess.mergedProcess;
const signup = require("./JS/signup");
const insertUser = signup.insertUser;
const handlePlay = require('./JS/handlePlay');
const showPlay = handlePlay.showPlay;
const sorting  = require('./JS/sorting');
const sortBy = sorting.sortBy;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret: 'squire'}));
app.set('views', './Views');

app.get('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('./');
})

app.post('/upload-checkpoint', (req, res) => {
    if(req.body.username=='sandarach' && req.body.password=='genesis4723'){
        res.render('Outside/Upload.ejs');
    }
    else{
        res.render('Outside/UploadCheckpoint.ejs');
    }
});

app.post('/upload', upload.single('uploaded_file'), function (req, res, next) {
    mergedProcess(req.file.path, req.body.authorName, req.body.authorAbout, req.body.bookName, req.body.bookAbout, req.body.bookPubYear);
    res.render('Outside/Upload.ejs');
});

app.get('/upload-checkpoint', async (req, res) => {
    if(!req.session.user_id){
        res.render('Outside/UploadCheckpoint.ejs');
    }
    else{
        res.redirect('./');
    }
});

app.post('/play', (req, res) => {
    if(req.body.isCorrect=="true"){
        squery('UPDATE users SET userPoints = userPoints + 100 WHERE userID = ?', [req.session.user_id]);
    }
    res.redirect('./play');
})

app.get('/play', async (req, res) => {
    if(!req.session.user_id){
        res.render('Outside/Login.ejs');
    }
    else{
        const {options, curBookName, curExtract, bookAbout, authorAbout} = await showPlay();
        const userData = await squery('SELECT * FROM users WHERE userID = ?', [req.session.user_id]);
        const username = userData[0].userName;
        const points = userData[0].userPoints;
        res.render('Inside/Play.ejs', {options, curBookName, curExtract, bookAbout, authorAbout, username, points});
    }
});

app.get('/about', async (req, res) => {
    if(!req.session.user_id){
        res.render('Outside/About.ejs');
    }
    else{
        const data = await squery('SELECT * FROM users WHERE userID = ?', [req.session.user_id]);
        const username = data[0].userName;
        const points = data[0].userPoints;
        res.render('Inside/About.ejs', {username, points})
    }
})

app.get('/signup', (req, res) => {
    res.render('Outside/Signup.ejs');
})

app.post('/signup', (req, res) => {
    if(req.body.password==req.body.repassword){
        insertUser(req.body.username, req.body.password);
    }
    res.redirect('./');
})

app.get('/login', (req, res) => {
    res.render('Outside/Login.ejs');
})

app.post('/login', async (req, res) => {
    const data = await squery('SELECT * FROM users WHERE userName = ?', [req.body.username]);
    if(data.length==0){
        res.redirect('./login');
    }
    else{
        const isValid = await bcrypt.compare(req.body.password, data[0].userPassword);
        if(isValid){
            req.session.user_id = data[0].userID;
            res.redirect('./');
        }
        else{
            res.redirect('./login');
        }
    }
})

app.get('/leaderboard', async (req, res) => {
    if(!req.session.user_id){
        const usersData = await squery('SELECT userName, userPoints FROM users');
        usersData.sort(sortBy('userPoints'));
        res.render("Outside/Leaderboard.ejs", {usersData});
    }
    else{
        const data = await squery('SELECT * FROM users WHERE userID = ?', [req.session.user_id]);
        const username = data[0].userName;
        const points = data[0].userPoints;
        const usersData = await squery('SELECT userName, userPoints FROM users');
        usersData.sort(sortBy('userPoints'));
        res.render('Inside/Leaderboard.ejs', {username, points, usersData});
    }
})

app.get('/', async (req, res) => {
    if(!req.session.user_id){
        res.render('Outside/MainPage.ejs');
    }
    else{
        const data = await squery('SELECT * FROM users WHERE userID = ?', [req.session.user_id]);
        const username = data[0].userName;
        const points = data[0].userPoints;
        res.render('Inside/MainPage.ejs', {username, points});
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on Port 3000');
})
