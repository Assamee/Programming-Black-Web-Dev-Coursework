// Client/fetchAPI.js
// This module contains functions to interact with the server's API endpoints for fetching and posting events.
export async function fetchEvents() {
    try {
        const response = await fetch('/events'); // Fetch events from the server (Fetch API defaults to GET method)
        return await response.json(); // .json() parses the JSON response body into a JavaScript object
    } catch (error) {
        console.error("Error fetching events:", error);
        return []; // Return an empty array on error
    }
}   

export async function postEvent(eventData) { // eventData is a JS object representing the new event
    try {
        const response = await fetch('/events', { // POST the new event to the server
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData) // Convert the event data to a JSON string
        });
        return response; // Return the Response from the server
    } catch (error) {
        console.error("Error saving event:", error);
        throw error; // Re-throw the error for further handling
    }
}
