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
    extractText TEXT,
    extractBookID INT,
    extractRating INT,
    PRIMARY KEY(extractID)
);

CREATE TABLE users (
    userID INT NOT NULL AUTO_INCREMENT,
    userEmail VARCHAR(500),
    userPassword VARCHAR(500),
    userName VARCHAR(500),
    userRating INT,
    PRIMARY KEY (userID)
);

insert into author (authorName, authorAbout) values ('test', 'test2');

INSERT INTO books (bookName, bookAuthorID, bookAbout, bookPubYear) VALUES ();

INSERT INTO extracts (extractText, extractBookID, extractRating) VALUES ();

select * from author;
select * from extracts;
select * from books;
select * from users;

SELECT 
    (authorID)
FROM
    author
WHERE
    authorName = 'test';


drop table extracts;
drop table author;
drop table books;
drop table users;


delete from author where authorID>=1;
delete from books where bookID>=1;
delete from extracts where extractID>=1;
INSERT INTO author (authorName, authorAbout) VALUES ("Robert A. Heinlein", "Robert A. Heinlein (1907-1988) was an influential American science fiction writer known 
for his imaginative storytelling and thought-provoking ideas. Considered one of the "Big Three" of science fiction alongside Isaac Asimov and Arthur C. Clarke, Heinlein's works explored themes such as space exploration, libertarianism, and social change. With his groundbreaking novels, including "Stranger in a Strange Land" and "Starship Troopers," Heinlein left a lasting impact on the genre and continues to inspire readers and writers alike.  Book Title: The Red Planet");

INSERT INTO books (bookName, bookAuthorID, bookAbout, bookPubYear) VALUES ("The Red Planet", 8, "In The Red Planet, Robert A. Heinlein takes readers on a thrilling 
adventure to the mysterious and dangerous world of Mars. Set in a future where space travel is a reality, the story follows the journey of a group of young colonists who must navigate the treacherous Martian landscape while facing unexpected challenges. With their lives at stake and the fate of the colony hanging in the balance, these brave pioneers must overcome their differences and work together to survive. Filled with Heinlein's trademark blend of thrilling action, vivid world-building, and thought-provoking ideas, The Red Planet is a must-read for fans of classic science fiction.", 1949);

SELECT COUNT(*) FROM extracts;