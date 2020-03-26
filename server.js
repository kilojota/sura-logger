const express = require('express');

const cron = require('node-cron');
const suraLogger = require('./sura-logger.js');

const app = express();

// cron.schedule('* * 6 * * *', () => {
cron.schedule('10 * * * * *', () => {
  suraLogger();
});

const PORT = process.env.PORT || 2000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Handle unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1)); // 1 means failure
});
