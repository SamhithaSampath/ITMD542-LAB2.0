// Your Data Utility Functions 
const fs = require('fs');

const DATA_FILE = 'contacts.json';

function createDataFileIfNotExists() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function readData() {
  createDataFileIfNotExists();

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    console.log('Read data:', data);
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading data file:', err.message);
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readData, writeData };