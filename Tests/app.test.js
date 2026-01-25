// app.test.js
// === Tests for the Express Application Endpoints ===

// Import the 'supertest' module, the Express app (app.js) and the 'fs' module 
const supertest = require('supertest');
const app = require('../app'); // Import the Express app 'app.js' in the parent directory
const fs = require('fs'); // Import 'fs' module for file operations

// Define the paths to the test JSON files
const testEventsPath = './Tests/test_events.json';
const testEventTypesPath = './Tests/test_eventTypes.json';

// === HELPER: Reset Test JSON Files ===
function resetTestFiles() {
    // Define the initial empty data for events and event types
    Empty_Data = JSON.stringify([], 2) // 2 adds whitespace for pretty printing (indentation, line breaks etc)

    // Write the empty data to the test JSON files to reset them
    fs.writeFileSync(testEventsPath, Empty_Data);
    fs.writeFileSync(testEventTypesPath, Empty_Data);
}



describe('Express App Endpoints', () => {

    // Reset the test JSON files before each test to ensure a clean state
    beforeEach(() => {
        resetTestFiles();
    });


    // =====================================================
    // Test the GET /events
    // =====================================================
    test('GET /events should return an empty array initially', async () => {
        const response = await supertest(app)
            .get('/events') // Fetch events from the server
            .expect('Content-Type', /json/) // Expect JSON response
            .expect(200); // Expect HTTP status 200 OK

         // Expect the response body to be an empty array
        expect(response.body).toEqual([]);
    });

    // =====================================================
    // Test the POST /events 
    // =====================================================
    test('POST /events should add an event', async () => {
        const response = await supertest(app)
            .post('/events')
            .send({
                // Sample event data to be added
                title: "Test Event",
                startDate: "2024-10-10T10:00",
                endDate: "2024-10-10T11:00",
                type: "Meeting",
                description: "This is a test event."
            })
            .expect(200); // Expect HTTP status 200 OK

        // Expect the response body to contain the added event with an assigned ID
        expect(response.body.id).toBeDefined();
    });

    // =====================================================
    // Test the POST /eventTypes (Assuming that names are unique)
    // =====================================================
    test('POST /eventTypes should add event type', async () => {
        // Generate a unique name for the event type to avoid conflicts
        randomNumber = Math.floor(Math.random() * 10000);
        const uniqueName = `Type_${randomNumber}`;

        // Test adding the new event type
        await supertest(app)
            .post('/eventTypes')
            .send({ 
                // Sample event type data to be added
                name: uniqueName,
                colour: "danger"
            })
            .expect(200);
    });

    // =====================================================
    // Test Duplicate Event Type Name Rejection
    // =====================================================
    test('POST /eventTypes should reject duplicates', async () => {
        const name = "Dupllicate Event Type";

        // Add it the first time
        await supertest(app)
            .post('/eventTypes')
            .send({
                name: name,
                colour:"danger",
            });
    
        // Try adding it a second time (Expect Failure)
        const response = await supertest(app)
            .post('/eventTypes')
            .send({
                name: name,
                colour:"danger",
            });
        // Expect HTTP status 400 Bad Request due to duplicate name
        expect(response.statusCode).toBe(400);
    });

    
    // =====================================================
    // Test the DELETE /events/:id
    // =====================================================
    test('DELETE /events/:id should delete event by ID', async () => {
        // Create an event to be deleted
        const createResponse = await supertest(app)
            .post('/events')
            .send({
                // Sample event data to be added
                title: "Delete Me",
                startDate: "2024-10-11T10:00",
                description: "This event will be deleted."
            })
            .expect(200); // Expect HTTP status 200 OK
        
        const eventId = createResponse.body.id; // Get the ID of the newly created event
        
        // Delete the newly created event
        await supertest(app)
            .delete(`/events/${eventId}`)
            .expect(200); // Expect HTTP status 200 OK
        
        // Verify that the event has been deleted
        await supertest(app)
            .delete(`/events/${eventId}`)
            .expect(404); // Expect HTTP status 404 Not Found since it's already deleted
    });




    // =====================================================
    // Test the GET /eventTypes
    // =====================================================
    test('GET /eventTypes should return all event types', async () => {
        const response = await supertest(app)
        .get('/eventTypes') // Fetch event types from the server
        .expect('Content-Type', /json/) // Expect JSON response
        .expect(200); // Expect HTTP status 200 OK
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
    // Test the GET /events/:id
    // =====================================================
    test('GET /events/:id should return event by ID', async () => {
        const response = await supertest(app)
            .get('/events/1') // Fetch event by ID from the server
            .expect('Content-Type', /json/) // Expect JSON response
            .expect(200); // Expect HTTP status 200 OK
    });


});