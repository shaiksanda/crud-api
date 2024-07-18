const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      book_id
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  let { bookId } = request.params;
  let bookQuery = `select * from book where book_id=${bookId}`;
  let book = await db.get(bookQuery);
  response.send(book);
});

//POST BOOK
app.post("/books/", async (req, res) => {
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  res.send({ bookId: bookId });
});

//UPDATE Book API

app.put("/books/:bookId/", async (req, res) => {
  const { bookId } = req.params;
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    update
      book 
      set 
        title='${title}',
         author_id=${authorId},
         rating=${rating},
         rating_count=${ratingCount},
         review_count=${reviewCount},
        description='${description}',
         pages=${pages},
        date_of_publication='${dateOfPublication}',
        edition_language='${editionLanguage}',
         price=${price},
        online_stores='${onlineStores}'
        where book_id=${bookId};
      );`;
  await db.run(updateBookQuery);
  res.send("Book Updated Successfully");
});

//Delete Book API

app.delete("/books/:bookId/", async (req, res) => {
  let { bookId } = req.params;
  let deleteQuery = `delete from book where book_id=${bookId}`;
  await db.run(deleteQuery);
  res.send("Book Deleted Successfully");
});

//GET Authors Book Details

app.get("/authors/:authorId/books/", async (req, res) => {
  const { authorId } = req.params;
  const bookQuery = `select * from book where author_id=${authorId}`;
  let book = await db.get(bookQuery);
  res.send(book);
});
