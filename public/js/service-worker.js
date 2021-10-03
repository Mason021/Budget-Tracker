// This is a Var that holds the Database
let db;
// Create a connection to IndexedDB 
const request = indexedDB.open('budget_tracker', 1);

// this eventhandler will shed if the database version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// when successful 
request.onsuccess = function(event) {
    // if database is successfully created with its object store 
    db = event.target.result;
    // this checks if the app is online
    if (navigator.onLine) {
      uploadTransaction();
    }
  };