// Your Contact Model Definition 
class Contact {
    constructor(firstName, lastName, emailAddress, notes) {
      this.id = generateUniqueId();
      this.firstName = firstName;
      this.lastName = lastName;
      this.emailAddress = emailAddress || '';
      this.notes = notes || '';
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
  }
  
  function generateUniqueId() {
    return 'generated-id-' + Date.now();
  }
  
  module.exports = Contact;