const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
var EPub = require('epub');
const cheerio = require('cheerio');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', './Views');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
});

const upload = multer({ 
    storage: storage 
});

const con = mysql.createConnection({
	host: "bookguessr-db.clybag8f9qab.ap-southeast-2.rds.amazonaws.com",
	user: "squire",
	password: "genesis4723",
	database: "bookguessr_db"
});

async function squery(queryString, values) {
	return new Promise((resolve, reject) => {
		con.connect(function (err) {
			if (err) reject(err);
			con.query(queryString, values, function (err, result, fields) {
				if (err) reject(err);
				resolve(result);
			});
		});
	});
}

async function mergedProcess(filepath, authorName, authorAbout, bookName, bookAbout, bookPubYear) {
    try {
        const chapters = await parse(filepath);
        console.log(chapters.length);
        const chapterText = await toText(chapters);
        console.log(chapterText.length);
        const selectedExtracts = await filter(chapterText);
        console.log(selectedExtracts.length);
        const shuffledExtracts = await shuffle(selectedExtracts, 2000);
        console.log(shuffledExtracts.length);

        const haveAuthor = await squery('SELECT authorID FROM author WHERE authorName = ?', [authorName]);

        if (haveAuthor.length == 0) {
            await squery('INSERT INTO author (authorName, authorAbout) VALUES (?, ?)', [authorName, authorAbout]);
        }

        const authorIDs = await squery('SELECT authorID FROM author WHERE authorName = ?', [authorName]);
        const authorID = authorIDs[0].authorID;

        const haveBook = await squery('SELECT bookID FROM books WHERE bookName = ?', [bookName]);

        if (haveBook.length == 0) {
            await squery('INSERT INTO books (bookName, bookAuthorID, bookAbout, bookPubYear) VALUES (?, ?, ?, ?)', [bookName, authorID, bookAbout, bookPubYear]);

            const bookIDResult = await squery('SELECT bookID FROM books WHERE bookName = ?', [bookName]);
            const bookID = bookIDResult[0].bookID;

            for (let i = 0; i < shuffledExtracts.length; i++) {
                squery('INSERT INTO extracts (extractText, extractBookID, extractRating) VALUES (?, ?, 2000)', [shuffledExtracts[i], bookID]);
            }
        }
    } catch (error) {
        // Handle any errors that occurred during the process
        console.error(error);
    }
}

async function parse(filepath) {
    return new Promise((resolve, reject) => {
        let epub = new EPub(filepath);
        const chapters = [];
        let chapterCounter = 0;

        epub.on("end", function () {
            epub.flow.forEach(function (chapter) {
                epub.getChapter(chapter.id, function (error, text) {
                    if (error) {
                    reject(error);
                    } else {
                    chapters.push(text);
                    chapterCounter++;

                    if (chapterCounter === epub.flow.length) {
                        resolve(chapters);
                    }
                    }
                });
            });
        });

        epub.parse();
    });
}

async function toText(chapters) {
    const chapterText = [];
    for (let i = 0; i < chapters.length; i++) {
        const $ = cheerio.load(chapters[i]);
        const plainText = $.text();
        chapterText.push(plainText);
        if (i == chapters.length - 1) {
            return chapterText;
        }
    }
}

async function filter(chapterText) {
    var selectedExtracts = [];
    for (let i = 0; i < chapterText.length; i++) {
        const sentences = chapterText[i].split("\n");
        const filteredSentences = sentences.filter(sentence => sentence.length >= 10);
        // console.log(filteredSentences.length);
        const chunkSize = 15;
        const chunks = [];
        for (let j = 0; j < filteredSentences.length; j += chunkSize) {
            const chunk = filteredSentences.slice(j, j + chunkSize).join(' ');
            chunks.push(chunk);
        }
        // console.log(chunks.length);
        // console.log(chunks[0]);
        for(let j=0; j<chunks.length; j++){
            selectedExtracts.push(chunks[j]);
        }
        if (i == chapterText.length - 1) {
            return selectedExtracts;
        }
    }
}

async function shuffle(array, n) {
    const shuffledArray = array.slice();
    let currentIndex = shuffledArray.length;
    let temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = shuffledArray[currentIndex];
        shuffledArray[currentIndex] = shuffledArray[randomIndex];
        shuffledArray[randomIndex] = temporaryValue;
    }
    return shuffledArray.slice(0, Math.min(n, array.length));
}

app.post('/uploading', upload.single('uploaded_file'), function (req, res, next) {
    mergedProcess(req.file.path, req.body.authorName, req.body.authorAbout, req.body.bookName, req.body.bookAbout, req.body.bookPubYear);
    res.render('Upload.ejs');
});

app.get('/upload', (req, res) => {
    res.render('Upload.ejs');
})

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

app.get('/', (req, res) => {
    res.render('MainPage.ejs');
})

app.listen(3000, () => {
    console.log('Listening on Port 3000');
})
