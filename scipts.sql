CREATE TABLE author(
    authorID INT NOT NULL AUTO_INCREMENT,
    authorName VARCHAR(500),
    authorAbout VARCHAR(1000),
    PRIMARY KEY(authorID)
); 

CREATE TABLE books(
    bookID INT NOT NULL AUTO_INCREMENT,
    bookName VARCHAR(500),
    bookAuthorID INT,
    bookAbout VARCHAR(1000),
    bookPubYear INT,
    PRIMARY KEY(bookID)
); 

CREATE TABLE extracts(
    extractID INT NOT NULL AUTO_INCREMENT,
    extractText VARCHAR(8000),
    extractBookID INT,
    extractRating INT,
    PRIMARY KEY(extractID)
);

CREATE TABLE users(
    userID INT NOT NULL AUTO_INCREMENT,
    userEmail VARCHAR(500),
    userPassword VARCHAR(500),
    userName VARCHAR(500),
    userRating INT,
    PRIMARY KEY(userID)
);
