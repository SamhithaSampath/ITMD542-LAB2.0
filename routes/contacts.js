const express = require('express');
const router = express.Router();
const contactsRepository = require('../repositories/contactsRepository');
const Contact = require('../models/contact');
const sanitizeHtml = require('sanitize-html');


/* Validation function to check if required fields are present
function validateContactData(data) {
  const { firstName, lastName } = data;
  return !(!firstName || !lastName);
}*/

// Validation function to check if required fields are present and non-numeric
function validateContactData(data) {
  const { firstName, lastName, emailAddress } = data;

  // Check for non-empty, non-numeric first name and last name
  const isNonEmptyString = value => typeof value === 'string' && value.trim() !== '';
  const containsOnlyLetters = value => /^[A-Za-z]+$/.test(value);

  const isNonNumericFirstName = isNonEmptyString(firstName) && containsOnlyLetters(firstName);
  const isNonNumericLastName = isNonEmptyString(lastName) && containsOnlyLetters(lastName);

  // Check for valid email address using a simple regex pattern
  const isInvalidEmail = emailAddress && !/^\S+@\S+\.\S+$/.test(emailAddress);

  // Build error message for each validation issue
  let errorMessage = 'Please correct the following issues:';
  if (!isNonNumericFirstName) errorMessage += ' First name should contain only letters.';
  if (!isNonNumericLastName) errorMessage += ' Last name should contain only letters.';
  if (isInvalidEmail) errorMessage += ' Please provide a valid email address.';

  // Return true if all validations pass
  return { isValid: isNonNumericFirstName && isNonNumericLastName && !isInvalidEmail, errorMessage };
}



/* Sanitize user input
function sanitizeContactData(data) {
  return {
    firstName: sanitizeHtml(data.firstName.trim()),
    lastName: sanitizeHtml(data.lastName.trim()),
    emailAddress: sanitizeHtml(data.emailAddress.trim()),
    notes: sanitizeHtml(data.notes.trim()),
  };
}*/

// Sanitize user input
function sanitizeContactData(data) {
  return {
    firstName: sanitizeHtml(data.firstName.trim(), { allowedTags: [], allowedAttributes: {} }),
    lastName: sanitizeHtml(data.lastName.trim(), { allowedTags: [], allowedAttributes: {} }),
    emailAddress: sanitizeHtml(data.emailAddress.trim(), { allowedTags: [], allowedAttributes: {} }),
    notes: sanitizeHtml(data.notes.trim(), { allowedTags: ['b', 'i', 'em', 'strong', 'a'], allowedAttributes: { 'a': ['href'] } }),
  };
}

// Route to list all contacts
router.get('/', (req, res) => {
  try {
    const contacts = contactsRepository.getAllContacts();
    res.render('contacts/index', { contacts, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to render a form for creating a new contact
router.get('/new', (req, res) => {
  res.render('contacts/new');
});



// Route to handle creating a new contact
router.post('/', (req, res) => {
  try {
    const { firstName, lastName, emailAddress, notes } = req.body;

    // Validate the form data
    const validationResult = validateContactData(req.body);
    if (!validationResult.isValid) {
      // Display detailed error message and render the form again
      const contacts = contactsRepository.getAllContacts();
      return res.render('contacts/new', { errorMessage: validationResult.errorMessage, contacts, layout: 'layout' });
    }

    // Sanitize user input
    const sanitizedData = sanitizeContactData(req.body);

    const newContact = new Contact(sanitizedData.firstName, sanitizedData.lastName, sanitizedData.emailAddress, sanitizedData.notes);

    // Attempt to create the contact
    const createdContact = contactsRepository.createContact(newContact);

    if (!createdContact) {
      // Handle the case where the contact creation fails
      return res.status(500).send('Failed to create contact');
    }

    res.redirect('/contacts');
  } catch (error) {
    // Handle unexpected errors
    console.error('Error creating contact:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Route to view a single contact
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const contact = contactsRepository.getContactById(id);

    if (!contact) {
      // Handle the case where the contact is not found
      res.status(404).send('Contact not found');
      return;
    }
// Format createdAt and updatedAt dates for better readability
const formattedContact = {
  ...contact,
  createdAt: new Date(contact.createdAt).toLocaleString(),
  updatedAt: new Date(contact.updatedAt).toLocaleString(),
};
res.render('contacts/show', { contact: formattedContact, layout: 'layout' });
} catch (error) {
  console.error('Error retrieving contact:', error);
  res.status(500).send('Internal Server Error');
}
});

// Route to render a form for editing an existing contact
router.get('/:id/edit', (req, res) => {
  try {
    const { id } = req.params;
    const contact = contactsRepository.getContactById(id);

    if (!contact) {
      // Handle the case where the contact is not found
      res.status(404).send('Contact not found');
      return;
    }

    res.render('contacts/edit', { contact, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving contact for editing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle updating an existing contact
router.post('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, emailAddress, notes } = req.body;

    // Validate the form data
    const validation = validateContactData(req.body);
    if (!validation.isValid) {
      // Display error message and render the form again
      const contact = contactsRepository.getContactById(id);
      return res.render('contacts/edit', { errorMessage: validation.errorMessage, contact, layout: 'layout' });
    }

    // Sanitize user input
    const sanitizedData = sanitizeContactData(req.body);

    // Fetch the existing contact
    const existingContact = contactsRepository.getContactById(id);

    if (!existingContact) {
      // Handle the case where the contact is not found
      res.status(404).send('Contact not found');
      return;
    }

    // Update the existing contact
    existingContact.firstName = sanitizedData.firstName;
    existingContact.lastName = sanitizedData.lastName;
    existingContact.emailAddress = sanitizedData.emailAddress;
    existingContact.notes = sanitizedData.notes;

    // Attempt to update the contact
    const success = contactsRepository.updateContact(existingContact);

    if (!success) {
      // Handle the case where the contact update fails
      return res.status(500).send('Failed to update contact');
    }

    res.redirect(`/contacts/${id}`);
  } catch (error) {
    // Handle unexpected errors
    console.error('Error updating contact:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to handle deleting a contact
router.post('/:id/delete', (req, res) => {
  try {
    const { id } = req.params;

    // Attempt to delete the contact
    const success = contactsRepository.deleteContact(id);

    if (!success) {
      // Handle the case where the contact deletion fails
      res.status(500).send('Failed to delete contact');
      return;
    }

    res.redirect('/contacts');
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle viewing a dynamically generated contact
router.get('/generated/:id', (req, res) => {
  try {
    // Get the dynamically generated ID from the URL
    const dynamicId = req.params.id;

    // Logic to fetch the dynamically generated contact
    const generatedContact = contactsRepository.getContactById(dynamicId);

    if (!generatedContact) {
      // Handle the case where the contact is not found
      res.status(404).send('Generated Contact not found');
      return;
    }

    res.render('contacts/show', { contact: generatedContact, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving generated contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;