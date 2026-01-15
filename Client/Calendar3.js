// Accessing the DOM after it is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // 1. GET Request: Load existing events from the server
    // ========================================================

    // Using an async function to use await for cleaner asynchronous code
    async function loadEvents() {
        try {
            // Await pause the function until the fetch Promise resolves
            const response = await fetch('/events'); // Fetch events from the server (Fetch defaults to GET method)
            const events = await response.json(); // .json parses the JSON response body into a JavaScript object

            // Sort Events: Compare two dates (a and b)
            // If the result is negative, 'a' comes first. If positive, 'b' comes first.
            events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            // Function to update the UI with the fetched events
            DisplayEvents(events);
        
        } catch (error) {
            // This runs if the internet crashes or the server is switched off
            console.error("Error loading events:", error); // Log any errors that occur during fetch
        }

        // Call the function immediately when the page loads
        loadEvents();
    }''
    // ========================================================
    // 2. POST Request: Save a new event (Stevenify-inspired)
    // ========================================================

    // This ensures HTML5 validation (like 'required') runs before JS takes over.
    const form = document.getElementById('newEventForm');

    if (form) {
        form.addEventListener('submit', async function(event) {

            // STOP the default browser behaviour (which is to reload the page immediately)
            event.preventDefault();

        // PART 1: Gather Data from the Form Submission

            // Collect data from the form using FormData API
            // Creates a FormData object from the form element
            // It automatically looks for input fields with 'name' attributes
            const formData = new FormData(form);

            // Convert the FormData into a standard JavaScript object, then to a JSON string
            const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));

            // Debugging: Check what we are about to send to the server
            console.log("Sending data:", formJSON);

        // PART 2: Send Data to the Server via Fetch API
            try {
                // Send the POST request to the server
                const response = await fetch('/events', {
                    method: 'POST', // Tells the server we are sending data (because fetch defaults to GET method)
                    headers: { "Content-Type": "application/json" }, // Tell the server we are sending JSON data
                    body: formJSON // The actual data being sent (as a JSON string)
                });

                // Part 3: Handle the Server's Response
                if (response.ok) { // If the response status is 200-299 (Success)

                    // Close the bootstrap modal via JS here if successful
                    const modalElement = document.getElementById('InputEventDetails');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide(); // Hide the modal

                    // Clear the form inputs after successful submission
                    clearFormInputs();

                    // Clear Form & Refresh List
                    form.reset();
                    loadEvents();

                } else {
                    // If the server says "400 Bad Request" or "500 Internal Server Error", etc.
                    alert("Failed to save event. Please try again." + response.statusText); // Alert the user about the failure
                }
            } catch (error) {
                // Network errors (e.g. server is switched off)
                console.error("Error saving event:", error); // Log any errors that occur during fetch
            }
        }); // End of form submit event listener
    } // End of if(form) check

}); // End of DOMContentLoaded event listener


function DisplayEvents(events) {
    // Use the DOM to get the element with ID "DisplayEvents" (This is where the events will be displayed)
    const container = document.getElementById("DisplayEvents");
    
    if (!container) return; // If the container doesn't exist, exit the function
    
    container.innerHTML = ''; // Clear existing content

    // Loop through each event in the events array
    events.forEach(event => {

        // Create a formatted date string
        const dateString = formatDate(event.startDate);

        // Create HTML for this event 
        const eventHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${dateString} | ${event.location}</h6>
                    <p class="card-text">${event.description}</p>
                </div>
            </div>
        `;

        // Add this new HTML to the container
        container.innerHTML += eventHTML;

    });
}




function formatDaterHeader(rawDateString) {
    // Turn the raw date string into a Date object
    const date = new Date(rawDateString);
    // Formating the Date Header (Uk format)
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',  // "Mon"
        day: 'numeric',    // "1"
        month: 'short',    // "Jan"
    }).toUpperCase(); // "MON, 1 JAN"
}


// Function to clear the modal input fields
function clearFormInputs() {
    // reset() method clears all input fields in the form with ID 'newEventForm'
    document.getElementById('newEventForm').reset();
}

// Function to format date strings
// E.g. "2026-01-01T10:00" to "Mon, 1 Jan 2026, 10:00"
function formatDate(rawDateString) {
    // Turn the raw date string into a Date object
    const date = new Date(rawDateString);

    // Formating the Date (Uk format)
    return date.toLocaleString('en-GB', {
        weekday: 'short',  // "Mon"
        day: 'numeric',    // "1"
        month: 'short',    // "Jan"
        year: 'numeric',   // "2026"
        hour: '2-digit',   // "10"
        minute: '2-digit', // "00"
        });
} // End of formatDateString function
