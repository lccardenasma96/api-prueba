const express = require('express');
const app = express();
const usersRouter = require('./users');
const { initDB } = require('./db');

app.use(express.json());
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB', err);
});
