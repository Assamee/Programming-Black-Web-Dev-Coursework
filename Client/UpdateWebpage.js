//Client/UpdateWebpage.js
// === This module contains functions to update the webpage UI with event data and handle layout adjustments ===

// --- Import ---
import { formatTime, formatShortDate, formatDateHeader } from './DateHandling.js';

export function DisplayEvents(events, eventTypes) {

    // ========================================================
    // Main Container Setup
    // ========================================================

    // Use the DOM to get the element with ID "DisplayEvents" (This is where the events will be displayed)
    const container = document.getElementById("DisplayEvents");
    if (!container) return; // If the container doesn't exist, exit the function
    
    container.innerHTML = ''; // Clear existing content

    // If there are no events to display then show a message saying no events found
    if (events.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted p-3">No events found</div>`;
        return;
    };
    
    
    // Creates a wrapper div so the events list fills the Bootstrap grid system correctly
    const wrapper = document.createElement('div');
    wrapper.className = 'col-12 p-0'; // Full width column with no padding

    // Trackers (for date headers and list groups)
    let lastHeaderDate = null; // Keeps track of the last date header added
    let currentListGroup = null; // Current list group for events under the same date

    // ========================================================
    // Loop Through Events and Build HTML
    // ========================================================

    events.forEach((event) => {
        // Get the header string for this event (e.g., "SUN, 12 JAN")
        const headerDateString = formatDateHeader(event.startDate);
    
        // ========================================================
        // Date Header Logic
        // ========================================================

        // If the date has changed, create a new header
        if (headerDateString !== lastHeaderDate) {

            // Create the Date Header div
            const headerDiv = document.createElement('div');
            headerDiv.className = 'sticky-top bg-body-tertiary p-2 px-3 fw-bold border-bottom border-secondary mb-0 shadow-sm';
            headerDiv.style.top = `var(--navbar-height, 0px)`; // Adjust the top position based on the navbar height
            headerDiv.style.zIndex = 1010; // Ensure the Date Header sits below the navbar (Bootstrap navbar default z-index is 1030, so this should be just below it)
            headerDiv.innerText = headerDateString; // "SUN, 12 JAN"
            wrapper.appendChild(headerDiv);

            // Start a new List Group for this day
            currentListGroup = document.createElement('div');
            currentListGroup.className = 'list-group list-group-flush mb-5'; 
            wrapper.appendChild(currentListGroup);

            // Update the date tracker
            lastHeaderDate = headerDateString;
        }

        // ========================================================
        // Event Item Logic
        // ========================================================

        // Safely extract event details with fallbacks (if any field is missing)
        const title = event.title || "Untitled Event";
        const location = event.location || "Location TBC";
        const type = event.eventType || "Event";

        // Find the matching oobject in the Event Types array to get the colour
        const matchingType = eventTypes.find(et => et.name === type); // et is each event type object in the array
        const colour = matchingType ? matchingType.colour : 'danger'; // Default to 'danger' if no match found (red badge)

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
        
        // Check if the event starts and ends on the same day
        const isSameDay = (start.toDateString() === end.toDateString());

        // Format the end date display based on whether it's the same day or not
        const endDateDisplay = isSameDay
            ? endTime // If same day, only show time (e.g., "10:00")
            : `${formatShortDate(end)}<br>${endTime}`; // If different day, show short date (e.g., "Jan 14")

        // =======================================================
        // Create Event Item HTML
        // =======================================================

        // Create the HTML structure for the single event item
        const itemHTML = ` <!-- Event Item Button -->
                <button type="button" 
                class="list-group-item list-group-item-action list-group-item-dark border-bottom py-3" 
                data-bs-toggle="modal" data-bs-target="#EventDetailModal"

                data-id="${event.id}"
                data-title="${title}"
                data-location="${location}"
                data-description="${event.description || ''}"
                data-eventtype="${type}"
                data-timestring="${startTime} - ${endTime}"
                >
                    <div class="row align-items-center w-100 g-0 flex-nowrap">
                        
                        <div class="col-auto text-center flex-shrink-0" style="width: 75px;">
                            <div class="fw-bold">${startTime}</div>

                            <div class="text-${colour} small fw-bold">
                                ${endDateDisplay}
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

                                <span class="badge rounded-pill bg-${colour} flex-shrink-0">${type}</span>
                            </div>
                        </div>

                    </div>
                </button>
        `;

        // Append the new event HTML to the list group
        if (currentListGroup) {
            currentListGroup.innerHTML += itemHTML;
            wrapper.appendChild(currentListGroup);
        }
   });
   container.appendChild(wrapper); // Finally, add the wrapper to the main container
}

// ========================================================
// Additional Utility Functions
// ========================================================

// Function to update the navbar height CSS variable (used when the window is resized)
export function updateNavbarHeight() {
    // Look for the first element with the 'sticky-top' class (the navbar), that is already on the page
    const navbarElement = document.querySelector('body > .sticky-top');
    //If found, get its height (offsetHeight), otherwise default to 0
    const navbarHeight = navbarElement ? navbarElement.offsetHeight : 0;

    // Set a CSS custom property to store the navbar height
    document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
}

// Function to clear all input fields in the new event form
export function clearFormInputs() {
    document.getElementById('newEventForm').reset();
}