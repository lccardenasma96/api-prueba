const express = require('express');
const { initDB } = require('./db');
const usersRouter = require('./users');

const app = express();
const PORT = 3000;

initDB().then(() => {
  app.use('/users', usersRouter);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
