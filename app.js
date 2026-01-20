// app.js
// === Main Express Application File ===

// Activate the library and call the express function with 'app'
const express = require('express');
const app = express();

// Import the 'fs' module to store events in a JSON file
const fs = require('fs');

// Import existing events from 'events.json' and event types from 'eventTypes.json' files
const jsonContent = require('./events.json');
const eventTypes = require('./eventTypes.json');

// Middleware (Getting Static files and JSON parsing)
app.use(express.static('Client')); // Get static files from 'Client' folder
app.use(express.json()); // Middleware to parse JSON bodies in later requests

// If the server is started, load events and event types into memory
let eventsData = jsonContent || [];
let eventTypesData = eventTypes || [];

// GET endpoint to retrieve all events from the server
app.get('/events', (req, res) => {
    res.json(eventsData); // Send the events array as JSON response
});

// Get endpoint to retrieve all event Types from the server
app.get('/eventTypes', (req, res) => {
    res.json(eventTypesData); // Send the event types array as JSON response
});

// POST endpoint to add a new event to the server
app.post('/eventTypes', (req,res) => {
    const newEventType = req.body; // Get the new EventType data fron the request body
    const name = newEventType.name;

    // Check for duplicate names (name is the unique identifier for event types)
    try {
        CheckifExists(name);
    } catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }

    eventTypesData.push(newEventType); // Add the new event type to the eventTypes array

    // Write the updated event Types array to 'eventTypes.json' for persistance
    let eventTypeData = JSON.stringify(eventTypesData, null, 2);
    fs.writeFileSync('./eventTypes.json', eventTypeData);
    console.log("Events saved to eventTypes.json", eventTypeData);

    res.json(newEventType); // Sends the data (the added event type) back as JSON response
});

// To make sure that the name is unique, we can use this function to generate unique IDs
// If that name already exists, then reject it
function CheckifExists(name) {
    for (const event in eventTypesData) {
        if (name === eventTypesData[event].name) {
            throw new Error("Event Type already exists");
        }   
    }
}

// POST endpoint to add a new event to the server
app.post('/events', (req, res) => {
    const newEvent = req.body; // Get the new event data from the request body

    newEvent.id = Date.now().toString(); // Assign a unique ID based on the current timestamp

    eventsData.push(newEvent); // Add the new event to the events array
    console.log("New event added:", newEvent.title, "ID:", newEvent.id); // Log for debugging

    // Write the updated events array to 'events.json' file for persistence
    let data = JSON.stringify(eventsData, null, 2); // null and 2 are for pretty-printing
    fs.writeFileSync('./events.json', data);
    console.log("Events saved to events.json", data);

    res.json(newEvent); // Sends the data (the added event) back as JSON response
    // The res.json() line automatically sends a 200 OK status and ends the POST request
});

// Search bar GET endpoint to search events by title (works with partial matches)
app.get('/events/:title', (req, res) => {
    const titleQuery = req.params.title.toLowerCase(); // Get the title from the URL parameter and convert to lowercase
    const filteredEvents = eventsData.filter(event => event.title && event.title.toLowerCase().includes(titleQuery)); // Filter events by title
    res.json(filteredEvents); // Send the filtered events as JSON response
});

// DELETE endpoint to delete an event by ID
app.delete('/events/:id', (req, res) => {
    const idToDelete = req.params.id; // Get the event ID from the URL parameter

    const initialLength = eventsData.length; // Store the initial length of the events array
    eventsData = eventsData.filter(event => event.id !== idToDelete); // Remove the event with the matching ID
    // Write the updated events array to 'events.json' file for persistence
    let data = JSON.stringify(eventsData, null, 2);
    fs.writeFileSync('./events.json', data);
    console.log("Event deleted. Updated events saved to events.json", data);

    if (eventsData.length < initialLength) {
        res.status(200).json({ message: 'Event deleted successfully' }); // Event found and deleted
    } else {
        res.status(404).json({ message: 'Event not found' }); // Event with the given ID not found
    }
});

app.put("/events/:id",(req,res) => {
    // Edit button may be implemented in the future
})


// Export the app so other files can use it (e.g., for testing)
module.exports = app;