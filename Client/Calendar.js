// Accessing the users inputs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    
    // Promise = an object representing the eventual completion (or failure) of an asynchronous operation
    // The fetch() function is made to be asynchronous by default (normally made async with async/await keywords)
    // Because Fetch API is asynchronous, it doesn't stop the rest of the code from running while waiting for the response

    // GET existing events from the server (fetch defaults to GET method)
    fetch('/events')
    // .then() is used to handle Promises returned by Fetch API
        .then(response => response.json()) // Parse the JSON response (turns the JSON string into a JavaScript object)
        .then(events => { // 'events' is the parsed JSON data collected from the server (stores an array of event objects)
            
            // Sorting Events by Start Date (earliest first)
            // .sort() method uses a sorting algotithm that compares two elements (a and b) at a time
            // new Date() converts the string into a Date object for accurate comparison
            // Subtracting the dates, is used for 1v1 comparisons for the sort method
            events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

            // Render the Timeline with the sorted events
            renderTimeline(events)
        });
    
    // Access the Save Button HTML Element (inside the DOM)
    const saveButton = document.getElementById("SaveEventButton");

    // Event Listener for Save Button
    // () => is an anonymous function that runs whenever the button is clicked
    saveButton.addEventListener("click", () => {

        // Collect Data from modals input fields by their IDs
        const eventTitle = document.getElementById("TitleInput").value;
        const eventDescription = document.getElementById("DescriptionInput").value;
        const eventLocation = document.getElementById("LocationInput").value;
        const eventStartDate = document.getElementById("StartDateInput").value;
        const eventEndDate = document.getElementById("EndDateInput").value;

        // Create an event object to send to the server
        const newEvent = {
            id: Date.now(), // Unique ID based on timestamp
            title: eventTitle,
            description: eventDescription,
            location: eventLocation,
            startDate: eventStartDate,
            endDate: eventEndDate
        }

        console.log("Event Saved:", newEvent); // Log the new event for debugging

        // POST the new event to the server using Fetch API in an async function
        fetch('/events', {
            method: 'POST',
            headers: {'Content-Type': 'application/json' }, // headers specify that the body content is JSON
            body: JSON.stringify(newEvent) // stringify converts the JavaScript object to a JSON string
        })
         // Update the UI after the server responds
         // .then() ensures that the following code runs only after the fetch request is complete
        .then(response => {
            if (response.ok) { // If the response is OK (status 200-299)
                // Reaload the page to show the updated list of events (MAY BE CHANGED LATER)
                location.reload(); // Reload the page to fetch and display the updated list of events

            } else {
                alert("Failed to save event. Please try again."); // Alert user if saving failed
            }
        // .catch() to handle any errors that occur during the fetch request (e.g. server is switched off)
        }).catch(error => console.error("Error:", error));

    }); // End of Save Button event listener

}); // End of DOMContentLoaded event listener

// Functions outside the DOMContentLoaded event listener are only called inside it


// Creates the Calendar Headers (one for each new day)
// This function is called once with the fully sorted array 'events'
function renderTimeline(events) {
    const displayContainer = document.getElementById("DisplayEvents");
    displayContainer.innerHTML = ''; // Clear existing content

    // Variable to track the last date header added
    let lastDateHeader = null;

    events.forEach(event => {
        //  Get the Date string for the Header
        const eventDateKey = new Date(event.startDate).toDateString();

        // If the date has changed, create a new header
        if (eventDateKey !== lastDateHeader) {
            const dateHeader = document.createElement("div");
            dateHeader.className = "sticky-top bg-secondary text-white p-2 px-3 fw-bold mt-3"; // Bootstrap classes for styling
            dateHeader.textContent = formatDaterHeader(event.startDate);

            // Add the date header to the display container
            displayContainer.appendChild(dateHeader);

            // Update the lastDateHeader variable to the current event's date
            lastDateHeader = eventDateKey;
        }
        // Create the Clickable List Item
        const eventButton = createEventItem(event);
        displayContainer.appendChild(eventButton);
    });
}

// Function to create the individual clickable button
function createEventItem(event) {
    const button = document.createElement("button");
    button.type = "button";

    // Bootstrap Classes:
    // list-group-item: Basic styling
    // list-group-item-action: Makes it clickable (hover effects)
    // border-0: Removes border (Clean flush look)
    // border-start border-4 border-primary: Adds the blue strip on the left
    button.className = "list-group-item list-group-item-action border-0 border-start border-4 border-primary py-3";
    button.type = "button"; // Defensive programming to specify button type (instead of letting guess, default is "submit", which would submit a form, causing page reload => unwanted behavior)

    // Format the time (e.g. "10:00 - 12:00")
    const startTime = new Date(event.startDate).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
    const endTime = new Date(event.endDate).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});

    button.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-center">
            <div>
                <span class="fw-bold me-3">${startTime}</span> 
                <span class="fw-bold">${event.title}</span>
            </div>
            <small class="text-muted">${endTime}</small>
        </div>
        <div class="d-flex w-100 justify-content-between align-items-center mt-1">
             <small class="text-muted ms-5">${event.location || 'No Location'}</small>
             </div>
    `;

    // Event Listener to open the modal when the button is clicked
    button.addEventListener("click", () => {
        // I'll implement the modal functionality later
    });
    // return button so it can be appended to the display container
    return button;
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
    document.getElementById("TitleInput").value = '';
    document.getElementById("DescriptionInput").value = '';
    document.getElementById("LocationInput").value = '';
    document.getElementById("StartDateInput").value = '';
    document.getElementById("EndDateInput").value = '';
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
