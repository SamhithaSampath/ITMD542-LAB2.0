// Your Contacts Repository Definition 
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/contacts.json');

function readData() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    console.log('Data before parsing:', data); // Add this line
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error.message);
    return [];
  }
}



function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function getAllContacts() {
  const contacts = readData();
  return contacts;
}

function getContactById(dynamicId) {
  const contacts = readData();
  return contacts.find(contact => contact.id === dynamicId);
}

function createContact(newContact) {
  const contacts = readData();
  newContact.id = generateId();
  newContact.createdAt = new Date().toISOString();
  newContact.updatedAt = new Date().toISOString(); // Set updatedAt to the current timestamp
  contacts.push(newContact);
  writeData(contacts);
  return newContact;
}



function updateContact(updatedContact) {
  const contacts = readData();
  const index = contacts.findIndex(contact => contact.id === updatedContact.id);
  if (index !== -1) {
    updatedContact.updatedAt = new Date().toISOString();
    contacts[index] = updatedContact;
    writeData(contacts);
    return true;
  }
  return false;
}

function deleteContact(id) {
  const contacts = readData();
  const updatedContacts = contacts.filter(contact => contact.id !== id);
  if (updatedContacts.length < contacts.length) {
    writeData(updatedContacts);
    return true;
  }
  return false;
}

function generateId() {
  return `generated-id-${Date.now()}`;
}

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};