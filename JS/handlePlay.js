const sqlcon = require("./sqlcon");
const squery = sqlcon.squery;

async function showPlay(){
    try {
        let curExtractID;
        let curExtract;
        let curBookID;
        let curBookName;
        let wrongBookIDs;
        let bookAbout;
        let curAuthorID;
        let authorAbout;
        let options = [];
    
        const numRowsData = await squery("SELECT COUNT(*) FROM extracts;");
        const numRows = numRowsData[0]['COUNT(*)'];
    
        curExtractID = Math.floor(Math.random() * numRows);
    
        const extractData = await squery('SELECT * FROM extracts WHERE extractID = ?', [curExtractID]);
        curExtract = extractData[0].extractText;
        curBookID = extractData[0].extractBookID;
    
        const bookData = await squery('SELECT * FROM books WHERE bookID = ?', [curBookID]);
        curBookName = bookData[0].bookName;
        bookAbout = bookData[0].bookAbout;
        curAuthorID = bookData[0].bookAuthorID;
    
        const countBooksData = await squery('SELECT COUNT(*) FROM books;');
        const uniqueIntegers = new Set();
        uniqueIntegers.add(curBookID);
    
        while (uniqueIntegers.size < 6) {
        const randomNumber = Math.floor(Math.random() * (countBooksData[0]['COUNT(*)'])) + 1;
        uniqueIntegers.add(randomNumber);
        }
    
        wrongBookIDs = Array.from(uniqueIntegers);
    
        for (const wrongBookID of wrongBookIDs) {
        const bookNameData = await squery('SELECT bookName FROM books WHERE bookID = ?', [wrongBookID]);
        options.push(bookNameData[0].bookName);
        }
    
        for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
        }
    
        const authorAboutData = await squery('SELECT authorAbout FROM author WHERE authorID = ?', [curAuthorID]);
        authorAbout = authorAboutData[0].authorAbout;
    
        return {options, curBookName, curExtract, bookAbout, authorAbout};
    } 
    catch (err) {
        console.log(err);
    }
}

exports.showPlay = showPlay;