// Import
import { formatTime, formatShortDate, formatDateHeader } from './FormatDate.js';
import { fetchEvents, postEvent } from './fetchAPI.js';

// Accessing the DOM after it is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    updateNavbarHeight(); // Initial call to set navbar height CSS variable
    window.addEventListener('resize', updateNavbarHeight); // Update navbar height CSS variable on window resize

    // ========================================================
    // 1. Load Events using the FetchAPI.js module 
    // ========================================================

    // Using an async function to use 'await' keyword inside it
    async function loadEvents() {
        let events = await fetchEvents(); // Use the imported fetchEvents function to get events
        events = events.filter(event => event.startDate); // Filter out events without a startDate

        // .sort() method uses a sorting algotithm that compares two elements (a and b) at a time, (new Date() converts the string into a Date object to compare)
        events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        DisplayEvents(events); // Function to update the UI with the fetched events
    }

    // Call the function immediately when the page loads
    loadEvents();
    
    // ========================================================
    // 2. Handle Form Submission to Add New Events
    // ========================================================

    const form = document.getElementById('newEventForm');

    if (form) { // Check if the form exists to avoid errors
        form.addEventListener('submit', async function(event) {

            // STOP the default browser behaviour (which is to reload the page immediately)
            event.preventDefault();
        
        // ========================================================
        // Gather Data from the Form Submission
        // ========================================================

            // FormData() creates an object, where each key is the 'name' attribute of an input field, and the value is the user-entered data
            const formData = new FormData(form);

            // Convert the FormData into a standard JavaScript object, then to a JSON string
            const formObj = Object.fromEntries(formData.entries());

        // ========================================================
        // Send the Data to the Server using the FetchAPI.js module
        // ========================================================

            // Use the imported postEvent function to send data to the server
            const response = await postEvent(formObj);
        
        // ========================================================
        // Handle the Server's Response
        // ========================================================

            //  Handle the Server's Response
            if (response.ok) { // If the response status is 200-299 (Success)

                // Close the bootstrap modal via JS here if successful
                const modalElement = document.getElementById('InputEventDetails');
                const modalInstance = bootstrap.Modal.getInstance(modalElement); // Bootstrap method to get the modal instance
                modalInstance.hide(); // Hide the modal

                // Clear Form & Refresh List
                form.reset();
                loadEvents();

            } else {
                // If the server says "400 Bad Request" or "500 Internal Server Error", etc.
                alert("Failed to save event. Please try again."); // Alert the user about the failure
            }
        }); // End of form submit event listener
    } // End of if(form) check

    // ========================================================
    // 3. Auto-fill Start Date when the Modal is Opened
    // ========================================================

    const eventModal = document.getElementById('InputEventDetails');
    // show.bs.modal is a Bootstrap-specific event that fires when the modal is about to be shown
    eventModal.addEventListener('show.bs.modal', () => {

        // Get the start and end date input fields
        const startDateInput = document.getElementById('StartDateInput');
        const endDateInput = document.getElementById('EndDateInput');

        // Only set the default date/time if the Start Date is currently empty
        if (!startDateInput.value) {
            const now = new Date(); // Get current Time (for Start Date)
            const end = new Date(now);
            end.setHours(now.getHours() + 1); // Default End Date to 1 hour after Start Date

            // ADJUST FOR TIMEZONES
            // .getTimezoneOffset() returns the difference in minutes between UTC and Local
            // Subtract to account for timezones (so .toISOString() looks like local time)
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
            
            // Format ISO string (YYYY-MM-DDTHH:MM:SS.sssZ) into 'YYYY-MM-DDTHH:MM'
            const currentDateTime = now.toISOString().slice(0,16);
        
            // Set the value of the Start Date input to the current date/time
            startDateInput.value = currentDateTime;

            // Only auto-fill End Date if it's also empty
            if (!endDateInput.value) {
                endDateInput.value = end.toISOString().slice(0,16);
            }
        }
    });

    // ========================================================
    // 4. Auto-update End Date when Start Date is Changed
    // ========================================================

    const startDateInput = document.getElementById('StartDateInput');
    const endDateInput = document.getElementById('EndDateInput');

    // if both inputs exist, add event listener to Start Date input
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', () => {

            const newStart = new Date(startDateInput.value);

            // Check if the new start date is valid (NOT an error)
            if (!isNaN(newStart.getTime())) {
                // Set the end date to be 1 hour after the new start date
                const newEnd = new Date(newStart);
                newEnd.setHours(newStart.getHours() + 1);

                // ADJUST FOR TIMEZONES
                newEnd.setMinutes(newEnd.getMinutes() - newEnd.getTimezoneOffset());
                // Update the End Date input field
                endDateInput.value = newEnd.toISOString().slice(0,16);
            }
        }
    )};


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
        const headerDateString = formatDateHeader(event.startDate);

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
        let end;
        if (event.endDate) { // If an end date exists, use it
            end = new Date(event.endDate);
        } else {  // Default to 1 hour after start time if end time is missing
            end = new Date(start);
            end.setHours(start.getHours() + 1);
        }

        // Variables to hold formatted date/time strings
        const startTime = formatTime(start);
        const endTime = formatTime(end);
        const shortDate = formatShortDate(end);
        

        // Create the HTML structure for the single event item
        const itemHTML = ` <!-- Event Item Button -->
                <button type="button" class="list-group-item list-group-item-action list-group-item-dark border-bottom py-3" data-bs-toggle="modal" data-bs-target="#EventDetailModal">
                    <div class="row align-items-center w-100 g-0 flex-nowrap">
                        
                        <div class="col-auto text-center flex-shrink-0" style="width: 75px;">
                            <div class="fw-bold">${startTime}</div>

                            <div class="text-danger small fw-bold">
                                ${shortDate}<br>${endTime}
                            </div>
                        </div>

                        <div class="col-auto text-center px-2">
                            <div class="d-inline-block border-end border-2 h-100" style="min-height: 40px;"></div>
                        </div>

                        <div class="col ps-2" style="min-width: 0;">
                            <div class="d-flex justify-content-between align-items-center">

                                <div style="min-width: 0;">
                                    <h6 class="mb-0 fw-bold text-truncate">${title}</h6>
                                    <small class="text-muted text-truncate d-block">📍 ${location}</small>
                                </div>

                                <span class="badge rounded-pill bg-danger flex-shrink-0">${type}</span>
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

// Function to update the navbar height CSS variable (used when the window is resized)
function updateNavbarHeight() {
    // Look for the first element with the 'sticky-top' class (the navbar), that is already on the page
    const navbarElement = document.querySelector('body > .sticky-top');
    //If found, get its height (offsetHeight), otherwise default to 0
    const navbarHeight = navbarElement ? navbarElement.offsetHeight : 0;

    // Set a CSS custom property to store the navbar height
    document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
}
