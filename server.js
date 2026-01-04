// Activate the library and call the express function with 'app'
const express = require('express');
const app = express();

// Middleware (Getting Static files and JSON parsing)
app.use(express.static('Client')); // Get static files from 'Client' folder
app.use(express.json()); // Middleware to parse JSON bodies in later requests

// In-memory array to store events (Temporary storage)
let events = [];

// GET endpoint to retrieve all events from the server
app.get('/events', (req, res) => {
    res.json(events); // Send the events array as JSON response
});

// POST endpoint to add a new event to the server
app.post('/events', (req, res) => {
    const newEvent = req.body; // Get the new event data from the request body
    events.push(newEvent); // Add the new event to the events array
    res.json(newEvent); // Sends the data (the added event) back as JSON response
    // The res.json() line automatically sends a 200 OK status and ends the POST request
});

// Start the Server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Note: This server uses in-memory storage for events, which means all data will be lost when the server restarts.
// Need to ensure that everything still works when the server is switched off and on again
// Will fix this with external storage like a database or file storage like a JSON file in future updates.

