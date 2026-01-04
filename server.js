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
    res.json(newEvent); // Respond with the new event
    res.status(201).end(); // Send a 201 Created status and end the response
});

// Start the Server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Note: This server uses in-memory storage for events, which means all data will be lost when the server restarts.

