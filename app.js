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
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret: 'squire'}));
app.set('views', './Views');


app.post('/upload-checkpoint', (req, res) => {
    if(req.body.username=='sandarach' && req.body.password=='genesis4723'){
        res.render('Upload.ejs');
    }
    else{
        res.render('UploadCheckpoint.ejs');
    }
});

app.post('/upload', upload.single('uploaded_file'), function (req, res, next) {
    mergedProcess(req.file.path, req.body.authorName, req.body.authorAbout, req.body.bookName, req.body.bookAbout, req.body.bookPubYear);
    res.render('Upload.ejs');
});

app.get('/upload-checkpoint', (req, res) => {
    res.render('UploadCheckpoint.ejs');
});

app.get('/play', (req, res) => {
    var curExtractID;
    var curExtract;
    var curBookID;
    var curBookName;
    var wrongBookIDs;
    var bookAbout;
    var curAuthorID;
    var authorAbout;
    var options = [];
    squery("SELECT COUNT(*) FROM extracts;")
        .then((data) => {
            var numRows = data[0]['COUNT(*)'];
            curExtractID = Math.floor(Math.random() * numRows);
            return squery('SELECT * FROM extracts WHERE extractID = ?', [curExtractID]);
        })
        .then((data) => {
            curExtract = data[0].extractText;
            curBookID = data[0].extractBookID;
            return squery('SELECT * FROM books WHERE bookID = ?', [curBookID]);
        })
        .then((data) => {
            curBookName = data[0].bookName;
            bookAbout = data[0].bookAbout;
            curAuthorID = data[0].bookAuthorID;
            return squery('SELECT COUNT(*) FROM books;');
        })
        .then((data) => {
            const uniqueIntegers = new Set();
            uniqueIntegers.add(curBookID);
            while (uniqueIntegers.size < 6) {
              const randomNumber = Math.floor(Math.random() * (data[0]['COUNT(*)'])) + 1;
              uniqueIntegers.add(randomNumber);
            }
            wrongBookIDs = Array.from(uniqueIntegers);
            return squery('SELECT bookName FROM books WHERE bookID = ?', [wrongBookIDs[0]]);
        })
        .then((data) => {
            options.push(data[0].bookName);
            return squery('SELECT bookName FROM books WHERE bookID = ?', [wrongBookIDs[1]]);
        })
        .then((data) => {
            options.push(data[0].bookName);
            return squery('SELECT bookName FROM books WHERE bookID = ?', [wrongBookIDs[2]]);
        })
        .then((data) => {
            options.push(data[0].bookName);
            return squery('SELECT bookName FROM books WHERE bookID = ?', [wrongBookIDs[3]]);
        })
        .then((data) => {
            options.push(data[0].bookName);
            return squery('SELECT bookName FROM books WHERE bookID = ?', [wrongBookIDs[4]]);
        })
        .then((data) => {
            options.push(data[0].bookName);
            return squery('SELECT bookName FROM books WHERE bookID = ?', [wrongBookIDs[5]]);
        })
        .then((data) => {
            options.push(data[0].bookName);
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
            return squery('SELECT authorAbout FROM author WHERE authorID = ?', [curAuthorID]);
        })
        .then((data) => {
            authorAbout = data[0].authorAbout;
            res.render('Play.ejs', { options, curBookName, curExtract, bookAbout, authorAbout });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/about', (req, res) => {
    res.render('About.ejs');
})

app.get('/signup', (req, res) => {
    res.render('Signup.ejs');
})

app.post('/signup', (req, res) => {
    insertUser(req.body.username, req.body.password);
    res.redirect('./');
})

app.get('/login', (req, res) => {
    res.render('Login.ejs');
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

app.get('/', (req, res) => {
    res.render('MainPage.ejs');
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on Port 3000');
})
