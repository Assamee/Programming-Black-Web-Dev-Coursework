// Accessing the DOM after it is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    updateNavbarHeight(); // Initial call to set navbar height CSS variable

    // Update navbar height CSS variable on window resize
    window.addEventListener('resize', updateNavbarHeight);

    // ========================================================
    // 1. GET Request: Load existing events from the server
    // ========================================================

    // Using an async function to use 'await' keyword inside it
    async function loadEvents() {
        try {
            // The fetch() function is made to be asynchronous by default (normally made async with async/await keywords)
            // Because Fetch API is asynchronous, it doesn't stop the rest of the code from running while waiting for the response

            // Await = pause the function until the fetch Promise resolves
            const response = await fetch('/events'); // Fetch events from the server (Fetch defaults to GET method)
            const events = await response.json(); // .json parses the JSON response body into a JavaScript object

            // Sorting Events by Start Date (earliest first)
            // .sort() method uses a sorting algotithm that compares two elements (a and b) at a time
            // new Date() converts the string into a Date object for accurate comparison
            // Subtracting the dates, is used for 1v1 comparisons for the sort method
            // If the result is negative, 'a' comes first. If positive, 'b' comes first.
            events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            // Function to update the UI with the fetched events
            DisplayEvents(events);
        
        } catch (error) {
            // This runs if the internet crashes or the server is switched off
            console.error("Error loading events:", error); // Log any errors that occur during fetch
        }
    }
    // Call the function immediately when the page loads
    loadEvents();
    
    // ========================================================
    // 2. POST Request: Save a new event (Stevenify-inspired)
    // ========================================================

    // This ensures HTML5 validation (like 'required') runs before JS takes over.
    const form = document.getElementById('newEventForm');

    // Check if the form exists to avoid errors
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
                    const modalInstance = bootstrap.Modal.getInstance(modalElement); // Bootstrap method to get the modal instance
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

// Functions outside the DOMContentLoaded event listener are only called inside it

// ========================================================
// Helper Functions
// ========================================================

function DisplayEvents(events) {
    // Use the DOM to get the element with ID "DisplayEvents" (This is where the events will be displayed)
    const container = document.getElementById("DisplayEvents");
    if (!container) return; // If the container doesn't exist, exit the function
    
    container.innerHTML = ''; // Clear existing content

    // If there are no events to display then show a message saying no events found
    if (events.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted p-3">No events found</div>`;
        return;
    }

    // Creates a wapper div so the events list fills the Bootstrap grid system correctly
    const wrapper = document.createElement('div');
    wrapper.className = 'col-12 p-0'; // Full width column with no padding

    // Trackers (for date headers and list groups)
    let lastHeaderDate = null; // Keeps track of the last date header added
    let currentListGroup = null; // Current list group for events under the same date

    // Loop through the events and build the HTML for each event (one at a time)
    events.forEach(event => {
        // Get the header string for this event (e.g., "SUN, 12 JAN")
        const headerDateString = formatDaterHeader(event.startDate);

        // If the date has changed, create a new header
        if (headerDateString !== lastHeaderDate) {
            
            // Create and append the Date Header
            const headerDiv = document.createElement('div');
            // Sticky-top makes it stick to the top while scrolling
            headerDiv.className = 'sticky-top bg-body-tertiary p-2 px-3 fw-bold border-bottom border-secondary mb-0 shadow-sm';
            headerDiv.style.top = `var(--navbar-height, 0px)`; // Adjust the top position based on the navbar height
            
            // Ensure the Date Header sits below the navbar in the "stacking order"
            headerDiv.style.zIndex = 1010; // Bootstrap navbar default z-index is 1030, so this should be just below it

            headerDiv.innerText = headerDateString; // "SUN, 12 JAN"
            wrapper.appendChild(headerDiv);

            // Start a new List Group for this day
            currentListGroup = document.createElement('div');
            currentListGroup.className = 'list-group list-group-flush mb-5'; 
            wrapper.appendChild(currentListGroup);

            // Update the date tracker
            lastHeaderDate = headerDateString;
        }

        // Safely extract event details with fallbacks (if any field is missing)
        const title = event.title || "Untitled Event";
        const location = event.location || "Location TBC";
        const type = event.eventType || "Event";

        // Parse the start and end dates
        const start = new Date(event.startDate);
        const end = new Date(event.endDate || event.startDate); // Fallback to startDate if endDate is missing

        // Variables to hold formatted date/time strings
        let startTime, endTime, shortDate;

        // Check if the date is Invalid
        if (isNaN(start.getTime())) { // isNaN check for Invalid/Missing Date
            // If date is missing/invalid, use placeholders
            startTime = "No Time";
            endTime = "No Time";
            shortDate = "No Date";
        } else {
            // If date is good, format it normally
            startTime = formatTime(start);
            endTime = formatTime(end);
            shortDate = formatShortDate(start);
        }

        // Create the HTML structure for the single event item
        const itemHTML = ` <!-- Event Item Button -->
                <button type="button" class="list-group-item list-group-item-action list-group-item-dark border-bottom py-3" data-bs-toggle="modal" data-bs-target="#EventDetailModal">
                    <div class="row align-items-center w-100 g-0">
                        
                        <div class="col-2 text-center">
                            <div class="fw-bold">${startTime}</div>

                            <div class="text-danger small fw-bold">
                                ${shortDate}<br>${endTime}
                            </div>
                        </div>

                        <div class="col-1 text-center">
                            <div class="d-inline-block border-end border-2 h-100" style="min-height: 40px;"></div>
                        </div>

                        <div class="col-9 ps-2">
                            <div class="d-flex justify-content-between align-items-center">

                                <div>
                                    <h6 class="mb-0 fw-bold">${title}</h6>
                                    <small class="text-muted">📍 ${location}</small>
                                </div>

                                <span class="badge rounded-pill bg-danger">${type}</span>
                            </div>
                        </div>

                    </div>
                </button>
        `;

        // Append the new event HTML to the list group
        if (currentListGroup) {
            currentListGroup.innerHTML += itemHTML;
        }

   });


   container.appendChild(wrapper); // Finally, add the wrapper to the main container

}


// Function to clear the modal input fields
function clearFormInputs() {
    // reset() method clears all input fields in the form with ID 'newEventForm'
    document.getElementById('newEventForm').reset();
}

// Function to update the navbar height CSS variable (used when the window is resized)
function updateNavbarHeight() {
    // Look for the first element with the 'sticky-top' class (the navbar), that is already on the page
    const navbarElement = document.querySelector('body > .sticky-top');
    //If found, get its height (offsetHeight), otherwise default to 0
    const navbarHeight = navbarElement ? navbarElement.offsetHeight : 0;

    // Set a CSS custom property to store the navbar height
    document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
}


// --- Extracts "09:00" ---
function formatTime(rawDateString) {
    return rawDateString.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// --- Extracts "Jan 14" ---
function formatShortDate(rawDateString) {
    return rawDateString.toLocaleDateString('en-GB', { 
        month: 'short', // "Jan"
        day: 'numeric'  // "14"
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
