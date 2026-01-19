// app.js
// === Main Express Application File ===

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

    newEvent.id = Date.now().toString(); // Assign a unique ID based on the current timestamp

    events.push(newEvent); // Add the new event to the events array
    console.log("New event added:", newEvent.title, "ID:", newEvent.id); // Log for debugging

    res.json(newEvent); // Sends the data (the added event) back as JSON response
    // The res.json() line automatically sends a 200 OK status and ends the POST request
});

// DELETE endpoint to delete an event by ID
app.delete('/events/:id', (req, res) => {
    const idToDelete = req.params.id; // Get the event ID from the URL parameter

    const initialLength = events.length; // Store the initial length of the events array
    events = events.filter(event => event.id !== idToDelete); // Remove the event with the matching ID

    if (events.length < initialLength) {
        res.status(200).json({ message: 'Event deleted successfully' }); // Event found and deleted
    } else {
        res.status(404).json({ message: 'Event not found' }); // Event with the given ID not found
    }
});

app.put("/events/:id",(req,res) => {
    



})


// Export the app so other files can use it (e.g., for testing)
module.exports = app;