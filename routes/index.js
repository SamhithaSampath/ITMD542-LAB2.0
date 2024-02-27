// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // Render the introduction page from the correct subdirectory
  res.render('contacts/index', { title: 'Welcome to My Contact App', layout: 'layout' });
});

module.exports = router;
