const Book = require('../models/Book');

// @desc    Fetch the book with all chapters and metadata
// @route   GET /api/book
// @access  Public
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findOne().sort({ createdAt: 1 });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Check if user has unlocked the book
// @route   GET /api/book/unlocked
// @access  Private
exports.checkBookUnlocked = async (req, res) => {
  try {
    const user = req.user;

    if (user && user.hasAccess === true) {
      return res.json({ unlocked: true });
    }

    res.json({ unlocked: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Upload or update the book (admin)
// @route   POST /api/book
// @access  Admin
exports.uploadBook = async (req, res) => {
  try {
    const {
      name,
      author,
      publisher,
      metadata,
      chapters,
      withVoicesFrom, // ✅ Added this field
    } = req.body;

    let book = await Book.findOne();

    if (book) {
      // ✅ Update existing fields if provided
      book.name = name || book.name;
      book.author = author || book.author;
      book.publisher = publisher || book.publisher;

      // ✅ Update withVoicesFrom if provided
      if (Array.isArray(withVoicesFrom)) {
        book.withVoicesFrom = withVoicesFrom;
      }

      // ✅ Merge metadata (preserve existing + overwrite updated)
      if (metadata && typeof metadata === 'object') {
        book.metadata = {
          ...(book.metadata || {}),
          ...metadata,
        };
      }

      // ✅ Append new chapters without deleting existing ones
      if (Array.isArray(chapters) && chapters.length > 0) {
        book.chapters = [...book.chapters, ...chapters];
      }

      await book.save();
      return res.json({ message: 'Book updated successfully', book });
    }

    // ✅ Create new book (first time)
    const newBook = await Book.create({
      name,
      author,
      publisher,
      metadata,
      chapters,
      withVoicesFrom: Array.isArray(withVoicesFrom) ? withVoicesFrom : [],
    });

    res.status(201).json({ message: 'Book created', book: newBook });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};
