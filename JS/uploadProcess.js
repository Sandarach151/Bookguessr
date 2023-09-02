var EPub = require('epub');
const cheerio = require('cheerio');
const sqlcon = require("./sqlcon");
const squery = sqlcon.squery;

async function mergedProcess(filepath, authorName, authorAbout, bookName, bookAbout, bookPubYear) {
    try {
        const chapters = await parse(filepath);
        console.log(chapters.length);
        const chapterText = await toText(chapters);
        console.log(chapterText.length);
        const selectedExtracts = await filter(chapterText);
        console.log(selectedExtracts.length);
        const shuffledExtracts = await shuffle(selectedExtracts, 500);
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
        const sentences = chapterText[i].split(". ");
        const filteredSentences = sentences.filter(sentence => sentence.length >= 10);
        // console.log(filteredSentences.length);
        const chunkSize = 5;
        const chunks = [];
        for (let j = 0; j < filteredSentences.length; j += chunkSize) {
            const chunk = filteredSentences.slice(j, j + chunkSize).join('. ');
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

exports.mergedProcess = mergedProcess;