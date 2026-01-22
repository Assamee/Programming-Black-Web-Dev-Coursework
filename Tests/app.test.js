// Tests/app.test.js
// === Tests for the Express Application Endpoints ===

// Import supertest and the Express app
const supertest = require('supertest');
const app = require('../app'); // Adjust the path as necessary to import your Express app

// Generate a random number to ensure unique event type names in tests
const number = Math.floor(Math.random() * 10000);

describe('Express App Endpoints', () => {

    // =====================================================
    // Test the GET /events
    // =====================================================
    test('GET /events should return all events', async () => {
        const response = await supertest(app)
        .get('/events') // Fetch events from the server
        .expect('Content-Type', /json/) // Expect JSON response
        .expect(200); // Expect HTTP status 200 OK
    });

    // =====================================================
    // Test the GET /eventsTypes
    // =====================================================
    test('GET /eventTypes should return all event types', async () => {
        const response = await supertest(app)
        .get('/eventTypes') // Fetch event types from the server
        .expect('Content-Type', /json/) // Expect JSON response
        .expect(200); // Expect HTTP status 200 OK
    });

    // =====================================================
    // Test the POST /events
    // =====================================================
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

    // =====================================================
    // Test the POST /eventTypes
    // =====================================================
    test('POST /eventTypes should add event types to the server', async () => {
        const response = await supertest(app).post('/eventTypes').send({
            // Sample event type data to be added
            name: `New Unique Event Type ${number}`, // Ensure this name is unique for the test to pass, by appending a random number
            colour:"danger", // Bootstrap colour class
        });
        expect(response.statusCode).toBe(200); // Expect HTTP status 200 OK
    });

    // =====================================================
    // Test duplicate /eventType name rejection (POST)
    // =====================================================
    test('POST /eventTypes should reject duplicate event type names', async () => {
        const response = await supertest(app).post('/eventTypes').send({
           // Sample event type data with a duplicate name
            name: `New Unique Event Type ${number}`, // Same name as previous test to trigger duplicate check;
            colour:"warning", // Bootstrap colour class
        });
        expect(response.statusCode).toBe(400); // Expect HTTP status 400 Bad Request due to duplicate name
    });

    // =====================================================
    // Test the GET /events/:title
    // =====================================================
    test('GET /events/:title should return event by title', async () => {
        const response = await supertest(app)
            .get('/events/Title') // Fetch event by title from the server
            .expect('Content-Type', /json/) // Expect JSON response
            .expect(200); // Expect HTTP status 200 OK
    });

    // =====================================================
    // Test the DELETE /events/:id
    // =====================================================
    test('DELETE /events/:id should delete event by ID', async () => {
        const response = await supertest(app)
            .delete('/events/1') // Attempt to delete event with ID '1')
            .expect(200); // Expect HTTP status 200 OK
    });


});