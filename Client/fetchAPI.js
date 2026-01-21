// Client/fetchAPI.js
// === This module contains functions to interact with the server's API endpoints for fetching and posting events ===

// ========================================================
// FETCH EVENTS AND EVENT TYPES FROM SERVER
// ========================================================

export async function fetchEvents() {
    try {
        const response = await fetch('/events'); // Fetch events from the server (Fetch API defaults to GET method)
        return await response.json(); // .json() parses the JSON response body into a JavaScript object
    } catch (error) {
        throw error; // Re-throw the error for further handling
    }
}

export async function fetchEventsByTitle(title) {
    try {
        const response = await fetch(`/events/${title}`); // Fetch events from the server (Fetch API defaults to GET method)
        return await response.json(); // .json() parses the JSON response body into a JavaScript object
    } catch (error) {
        throw error; // Re-throw the error for further handling
    }
}

// Fetch Event Types from the server
export async function fetchEventTypes() {
    try{
        const response = await fetch('/eventTypes'); // Fetch event types from the server
        return await response.json(); // .json() parses the JSON response body into a JavaScript object
    } catch (error) {
        throw error; // Re-throw the error for further handling
    }
}

// ========================================================
// POST NEW EVENTS AND EVENT TYPES TO SERVER
// ========================================================

export async function postEvent(eventData) { // eventData is a JS object representing the new event
    try {
        const response = await fetch('/events', { // POST the new event to the server
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData) // Convert the event data to a JSON string
        });
        return response; // Return the Response from the server
    } catch (error) {
        throw error; // Re-throw the error for further handling
    }
}

export async function postEventTypes(eventType) { // eventTypes is a JS object representing the new event type
    try {   
        const response = await fetch('/eventTypes', { // POST the new event to the server
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventType) // Convert the event Type data into a string
        });
        return response; // Return the Response from the server
    } catch(error) {
        throw error; // Re-throw the error for further handling
    }
}

// ========================================================
// DELETE EVENT FROM SERVER
// ========================================================

export async function deleteEvent(eventId) {
    try { // Send a DELETE request (to /events/:id) on the server to delete the event with the specified ID
        const response = await fetch(`/events/${eventId}`, {
            method: 'DELETE'
        });
        return response; // Return the Response from the server
    } catch (error) {
        throw error; // Re-throw the error for further handling
    }
}

