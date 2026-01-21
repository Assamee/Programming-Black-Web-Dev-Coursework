// Tests/app.test.js
// === Tests for the Express Application Endpoints ===

// Import supertest and the Express app
const supertest = require('supertest');
const app = require('../app'); // Adjust the path as necessary to import your Express app



describe('Express App Endpoints', () => {

    // Test the GET /events endpoint
    test('GET /events should return all events', async () => {
        const response = await supertest(app).get('/events'); // Fetch events from the server
        expect(response.statusCode).toBe(200); // Expect HTTP status 200 OK
    });

    // Test the GET /events/id endpoint
    test('GET /eventTypes should return all event types', async () => {
        const response = await supertest(app).get('/eventTypes'); // Fetch event types from the server
        expect(response.statusCode).toBe(200); // Expect HTTP status 200 OK
    });
    // Test the POST /eventTypes endpoint
    test('POST /eventTypes should add event types to the server', async () => {
        const response = await supertest(app).post('/eventTypes').send({
            // Sample event type data to be added
            name: "New Unique Event Type 3", // Ensure this name is unique for the test to pass
            colour:"danger", // Bootstrap colour class
        });
        expect(response.statusCode).toBe(200); // Expect HTTP status 200 OK
    });

    // Test the POST /events endpoint
    test('POST /events should add an event to the server', async () => {
        const response = await supertest(app).post('/events').send({
            // Sample event data to be added
            title: "Test Event",
            date: "2024-10-10",
            time: "10:00",
            type: "Meeting",
            description: "This is a test event."
        });
        expect(response.statusCode).toBe(200); // Expect HTTP status 200 OK
    });
    

});