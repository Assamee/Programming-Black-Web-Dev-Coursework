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
                eventType: "Meeting",
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
    // Test the PUT /events/:id (Edit Event)
    // =====================================================
    test('PUT /events/:id should update event by ID', async () => {
        // Create an event to be updated
        const createResponse = await supertest(app)
            .post('/events')
            .send({
                // Sample event data to be added
                title: "Original Title",
                startDate: "2024-10-10T10:00",
                description: "Original event description.",
                eventType: "Work" 
            })
            .expect(200); // Expect HTTP status 200 OK
        
        // Get the ID of the newly created event
        const eventId = createResponse.body.id;
    
        // Send a PUT request to update the event with the specified ID
        const updateResponse = await supertest(app)
            .put(`/events/${eventId}`)
            .send({
                // Updated event data
                title: "Updated Title", // Changed title
                startDate: "2024-10-10T12:00", // Changed start date/time
                description: "Original event description.", // Keep description the same
                eventType: "Personal"  // Changed event type
            })
            .expect('Content-Type', /json/) // Expect JSON response
            .expect(200); // Expect HTTP status 200 OK
        
        // Check that the response body contains the updated event data
        expect(updateResponse.body.title).toBe("Updated Title"); // Updated title
        expect(updateResponse.body.startDate).toBe("2024-10-10T12:00"); // Updated start date/time
        expect(updateResponse.body.description).toBe("Original event description."); // Unchanged description
        expect(updateResponse.body.eventType).toBe("Personal"); // Updated event type
    });

    // =====================================================
    // Test PUT /events/:id with Non-Existent ID
    // =====================================================
    test('PUT /events/:id should return 404 for non-existent ID ', async () => {
        await supertest(app)
            .put('/events/99999') // Use a non-existent event ID
            .send({
                // Sample updated event data
                title: "Non-existent Event",
                startDate: "2024-10-10T10:00"
            })
            .expect(404); // Expect HTTP status 404 Not Found
    });

    // =====================================================
    // Test Validation: POST /events with Invalid Dates
    // =====================================================
    test('POST /events should reject if endDate is before startDate', async () => {
        const response = await supertest(app)
            .post('/events')
            .send({
                title: "Invalid Date Event",
                startDate: "2025-01-02T10:00",
                endDate: "2025-01-01T10:00", // <--- Ends BEFORE it starts
                eventType: "Meeting"
            })
            .expect('Content-Type', /json/)
            .expect(400); // Expect Bad Request

        expect(response.body.message).toBe("End date cannot be before start date");
    });

    // =====================================================
    // Test Validation: PUT /events/:id with Invalid Dates
    // =====================================================
    test('PUT /events/:id should reject update if endDate is before startDate', async () => {
        // Create a valid event
        const createResponse = await supertest(app)
            .post('/events')
            .send({
                title: "Valid Event",
                startDate: "2025-01-01T10:00",
                endDate: "2025-01-01T11:00",
                eventType: "Meeting"
            })
            .expect(200);
        
        // Get the ID of the newly created event
        const eventId = createResponse.body.id;

        // Try to update the newly created event with invalid dates
        const updateResponse = await supertest(app)
            .put(`/events/${eventId}`)
            .send({
                title: "Broken Update",
                startDate: "2025-01-02T10:00",
                endDate: "2025-01-01T10:00", // <--- Ends BEFORE it starts
                eventType: "Meeting"
            })
            .expect('Content-Type', /json/)
            .expect(400); // Expect Bad Request

        expect(updateResponse.body.message).toBe("End date cannot be before start date");
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
        await supertest(app)
            .get('/eventTypes') // Fetch event types from the server
            .expect('Content-Type', /json/) // Expect JSON response
            .expect(200); // Expect HTTP status 200 OK
    });


    // =====================================================
    // Test the GET /events/:title
    // =====================================================
    test('GET /events/:title should return event by title', async () => {
        await supertest(app)
            .get('/events/Title') // Fetch event by title from the server
            .expect('Content-Type', /json/) // Expect JSON response
            .expect(200); // Expect HTTP status 200 OK
    });

    // =====================================================
    // Test the GET /events/id/:id
    // =====================================================
    test('GET /events/id/:id should return event by ID', async () => {
        // Create the event type first to satisfy foreign key constraint
        await supertest(app)
            .post('/eventTypes')
            .send({
                name: "Work",
                colour: "danger"
            })
            .expect(200);


        // Create an event to be fetched by ID
        const createResponse = await supertest(app)
            .post('/events')
            .send({
                // Sample event linked to event type data to be added
                title: "Event to Fetch by ID",
                startDate: "2024-10-12T10:00",
                description: "This event will be fetched by ID.",
                eventType: "Work"
            })
            .expect(200); // Expect HTTP status 200 OK

        // Get the event ID
        const eventID = createResponse.body.id;
        
        // Fetch the event by ID using the correct URL endpoint
        const response = await supertest(app)
            .get(`/events/id/${eventID}`) // Fetch event by ID from the server
            .expect('Content-Type', /json/) // Expect JSON response
            .expect(200); // Expect HTTP status 200 OK

        // Verify that the fetched event matches the created event
        expect(response.body.id).toBe(eventID);
        expect(response.body.title).toBe("Event to Fetch by ID");

        // Verify that the relationship join is working
        expect(response.body.eventType).toBe("Work");

        // Check the joined event type details ('relatedType' as defined in app.js)
        expect(response.body.relatedType).toBeDefined();
        expect(response.body.relatedType.name).toBe("Work");
        expect(response.body.relatedType.colour).toBe("danger");
    });

    // =====================================================
    // Test GET /events/id/:id with Non-Existent ID
    // =====================================================
    test('GET /events/id/:id should return 404 for non-existent ID', async () => {
        const response = await supertest(app)
            .get('/events/id/9999999') // Use a made-up ID
            .expect('Content-Type', /json/)
            .expect(404); // This forces app.js to run Line 125
        
        expect(response.body.message).toBe("Event not found");
    });

});