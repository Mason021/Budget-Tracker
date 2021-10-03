// This is a Var that holds the Database
let db;
// Create a connection to IndexedDB 
const request = indexedDB.open('budget_tracker', 1);

// this eventhandler will shed if the database version changes
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_Entry', { autoIncrement: true });
};

// when successful 
request.onsuccess = function (event) {
    // if database is successfully created with its object store 
    db = event.target.result;
    // this checks if the app is online
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};


// kicks in if new transaction is submitted but dont' currently have an internet connection
function saveRecord(record) {
    // open new entry to db with ability to read and write
    const transaction = db.transaction(['new_Entry'], 'writeRead');

    // permission to access the object store 
    const statementObjectStore = transaction.objectStore('new_Entry');

    // submit new record to your store with the add method
    statementObjectStore.add(record);
};

// function that will handle data collection
function uploadTransaction() {
    // open a entry on the database
    const transaction = db.transaction(['new_Entry'], 'writeRead');

    // access your object store
    const statementObjectStore = transaction.objectStore('new_Entry');

    // takes all entries from object store and sets them to a variable
    const getEverything = statementObjectStore.getEverything();

    // if 'getEverything()' executes successfully, this function will run
    getEverything.onsuccess = function () {
        // any data in indexedDB gets sent to the api server
        if (getEverything.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getEverything.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open another entry
                    const transaction = db.transaction(['new_Entry'], 'writeRead');
                    // access the object store
                    const statementObjectStore = transaction.objectStore('new_Entry');
                    // clear out all entries in your store
                    statementObjectStore.clear();

                    alert('syncing... all entries have now been entered and are up to date');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

// Eventlistener that looks for the app to connect and come back online
window.addEventListener('online', uploadTransaction);