var express = require("express");
var router = express.Router();
const Book = require("../models/").Book;
const { Op } = require("sequelize");

// Define results to be shown on each page
const resultsPerPage = 10;

// Handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

// GET home index page populated with full book dataset
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Fetch the full book list from the database, sort by year
    const bookList = await Book.findAll({ order: [["year", "ASC"]] });

    // Calculate the number of records in the dataset
    const count = bookList.length;

    // Display the first page of the dataset based on desired results per page
    const results = bookList.slice(0, resultsPerPage);
    res.render("index", {
      books: results,
      count,
      resultsPerPage,
    });
  })
);

// GET records based on page to be displayed
router.get(
  "/page=:page",
  asyncHandler(async (req, res) => {
    const bookList = await Book.findAll({ order: [["year", "ASC"]] });

    // Extract page reference from params
    const page = req.params.page;

    // Extract length of dataset to display in DOM
    const count = bookList.length;

    // Calculate start and end indexes for splicing
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = resultsPerPage * page;

    // Slice array to display only the current page range
    const results = bookList.slice(startIndex, endIndex);

    if (results.length === 0) {
      // If the user alters the URL to a page without any content to display, redirect to 404 error page.
      res.redirect("page-not-found");
    } else {
      // Otherwise, render the results for the current page
      res.render("index", {
        books: results,
        count,
        resultsPerPage,
      });
    }
  })
);

// GET results from the search input and render results in the DOM
router.get(
  `/search`,
  asyncHandler(async (req, res) => {
    // Destructure the query from the query object
    const { query } = req.query;
    // If there is no search query (blank submission), redirect to home and repopulate the book list.
    if (!query) {
      res.redirect("/");
    } else {
      // Else, search for books that match the query string
      const books = await Book.findAll({
        where: {
          [Op.or]: {
            title: {
              [Op.like]: `%${query}%`,
            },
            author: {
              [Op.like]: `%${query}%`,
            },
            genre: {
              [Op.like]: `%${query}%`,
            },
            year: {
              [Op.like]: `%${query}%`,
            },
          },
        },
      });

      // Render book list with search results
      res.render("index", { books, count: books.length });
    }
  })
);

// GET new book form page
router.get("/new", (req, res) => {
  // Passing empty book object for form input fields
  res.render("new-book", { book: {} });
});

// POST new book to database
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      // Create new entry and redirect back to home page
      book = await Book.create(req.body);
      res.redirect("/");
    } catch (error) {
      // Otherwise...
      if (error.name === "SequelizeValidationError") {
        // Save the book input fields into the book variable, and re-render the form with the staged input
        book = await Book.build(req.body);
        console.log(error.errors);
        res.render("new-book", {
          book,
          errors: error.errors,
        });
      } else {
        // Otherwise, return an error
        throw error;
      }
    }
  })
);

// GET individual book record
router.get(
  "/:id/edit",
  asyncHandler(async (req, res) => {
    // Pull id from the request parameters
    const { id } = req.params;
    // Fetch a book record from the database using the parameter ID
    const book = await Book.findByPk(req.params.id);

    if (book) {
      // If the book exists, forward to the update page and populate with the book details
      res.render("update-book", { id, book });
    } else {
      // Otherwise, throw an error
      res.sendStatus(404);
    }
  })
);

// UPDATE an individual book record
router.post(
  "/:id/edit",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/");
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render(`update-book`, {
          book,
          errors: error.errors,
        });
      } else {
        throw error;
      }
    }
  })
);

// DELETE an individual book record
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    // Pull the book based on the current ID params
    const book = await Book.findByPk(req.params.id);

    if (book) {
      // If the record exists, destroy it and redirect to home page
      await book.destroy();
      res.redirect("/");
    } else {
      // Otherwise, throw an error
      res.sendStatus(404);
    }
  })
);

module.exports = router;
