const { parentPort } = require('worker_threads');
const admin = require("firebase-admin");
let firebaseConfig = {
    apiKey: "XXX-XXXX-XXXX-XXX",
    authDomain: "XXX-XXX-XXX-XXX",
    databaseURL: "XXX-XXXX-XXXX-XXX",
    projectId: "XXX-XXXX-XXXX-XXX",
    storageBucket: "XXX-XXXX-XXXX-XXXX",
    messagingSenderId: "XXX-XXXX-XXXX-XXXX",
    appId: "XXX-XXXX-XXXX-XXXX"
};



// Initialize Firebase
admin.initializeApp(firebaseConfig);
let db = admin.firestore();
//get current data in DD-MM-YYYY format
let date = new Date ();
let currDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
//receive crawled data from main thread
parentPort.once("message", (message) => {
    console.log("Received data from mainWorker...");
    // store data gotten from main thread in database
    db.collection("Rates").doc(currDate).set({
        rates: JSON.stringify(message)
    }).then(() => {
        //sen data back to main thread if operation was successfull
        parentPort.postMessage("Data saved successfully");
    })
    .catch((err) => console.log(err))
});