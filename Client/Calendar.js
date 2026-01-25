//Client/Calendar.js
// === Main Client-Side JavaScript for Calendar Application ===

// Import necessary functions from other modules
import { getLocalNowString, getOneHourLaterString } from './DateHandling.js';
import { DisplayEvents, updateNavbarHeight, getBootstrapColour, clearEventFormInputs, clearEventTypeFormInputs } from './UpdateWebpage.js';
import { fetchEvents, fetchEventsByTitle, fetchEventTypes, postEvent, postEventTypes, updateEvent, deleteEvent } from './fetchAPI.js';

// Accessing the DOM after it is fully loaded
document.addEventListener("DOMContentLoaded", () => { 
    // UI Setup
    updateNavbarHeight(); // Initial call to set navbar height CSS variable
    window.addEventListener('resize', updateNavbarHeight); // Update navbar height CSS variable on window resize

    const container = document.getElementById("DisplayEvents");

    // ========================================================
    // 1. Load Events and Event Types using the FetchAPI.js module 
    // ========================================================

    // Using an async function to use 'await' keyword inside it
    async function loadEvents() {

        // Try-catch for error handling when fetching data from the server (for 'Graceful Error Handling')
        try {
            // Promise.all to fetch BOTH events and event types simultaneously
            let [events, types] = await Promise.all([
                fetchEvents(), fetchEventTypes()
            ]);
            // Server-side Error handling

            // "" is falsy, so .filter() removes any events with a missing title or startDate
            events = events.filter(event => event.title); // Filter out events without a title
            events = events.filter(event => event.startDate); // Filter out events without a startDate

            // .sort() method uses a sorting algotithm that compares two elements (a and b) at a time, (new Date() converts the string into a Date object to compare)
            events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()); // Sort events by startDate in ascending order

            // Call the DisplayEvents function from UpdateWebpage.js to update the UI
            DisplayEvents(events, types);
        
        } catch (error) {
            // IF SERVER IS DOWN: Show Error Message
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Connection Lost</h4>
                    <p>Please restart the server and try again.</p>
                    <hr>
                    <button id="retryButton(LoadEvents)" class="btn btn-outline-danger btn-sm">Try Again</button>
                </div>
            `;
            // Add event listener to the retry button to reload events when clicked
            document.getElementById('retryButton(LoadEvents)').addEventListener('click', () => {
                loadEvents(); // Retry loading events
            });
        }
    }

    // Call the function immediately when the page loads
    loadEvents();
    
    // Fetch Event Types
    async function loadEventTypes() {

        try {
            const eventTypes = await fetchEventTypes(); // Use the imported fetchEventTypes function to get event types
            const typeSelect = document.getElementById('TypeInput'); // Get the event type dropdown element

            if (!typeSelect) return; // If the dropdown doesn't exist, exit the function

            // Clear existing options in the dropdown
            typeSelect.innerHTML = '<option selected disabled value="">Select an event type...</option>';

            // Create a new option element in the dropdown for each event type
            eventTypes.forEach(type => {
                const option = document.createElement('option'); // Create a new option element
                option.value = type.name; // Set the option value to the event type name
                option.text = type.name; // Set the option text to the event type name
                typeSelect.appendChild(option); // Add the option to the dropdown
            });
        
        } catch (error) {
            // IF SERVER IS DOWN: Show Error Message
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Connection Lost</h4>
                    <p>Please restart the server and try again.</p>
                    <hr>
                    <button id="retryButton" class="btn btn-outline-danger btn-sm">Try Again</button>
                </div>
            `;

            // Add event listener to the retry button to reload events when clicked
            document.getElementById('retryButton').addEventListener('click', () => {
                loadEvents(); // Retry loading events
            });
        }
    }

    // Call the function immediately when the page loads
    loadEventTypes();

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

                // Get the Event ID from the hidden input (if editing an existing event)
                const eventID = document.getElementById('EventIdInput').value;

            // ========================================================
            // Send the Data to the Server using the FetchAPI.js module
            // ========================================================

            try {
                // Decide whether to POST a new event or PUT (update) an existing event
                let response;
                if (eventID) {
                    response = await updateEvent(eventID, formObj); // Update existing event
                } else {
                    response = await postEvent(formObj); // Create new event
                }
            
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
                    clearEventFormInputs();
                    loadEvents();

                } else {
                    // If the server says "400 Bad Request" or "500 Internal Server Error", etc.
                    alert("Failed to save event. Please try again."); // Alert the user about the failure
                }
            } catch (error) {
                // IF SERVER IS DOWN: Show Error Message
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Connection Lost</h4>
                        <p>Please restart the server and try again.</p>
                        <hr>
                        <button id="retryButton(PostEvent)" class="btn btn-outline-danger btn-sm">Try Again</button>
                    </div>
                `;
                // Add event listener to the retry button to reload events when clicked
                document.getElementById('retryButton(PostEvent)').addEventListener('click', () => {
                    loadEvents(); // Retry loading events
                });
            }
        }); // End of form submit event listener
    } // End of if(form) check

    // ========================================================
    // 3. Auto-fill Start Date when the Modal is Opened
    // ========================================================

    const eventModal = document.getElementById('InputEventDetails');
    if (eventModal) {
        // show.bs.modal is a Bootstrap-specific event that fires when the modal is about to be shown    
        eventModal.addEventListener('show.bs.modal', () => {

            // Get the start and end date input fields
            const startDateInput = document.getElementById('StartDateInput');
            const endDateInput = document.getElementById('EndDateInput');

            // Only set the default date/time if the Start Date is currently empty
            if (startDateInput && !startDateInput.value) {

                const nowString = getLocalNowString(); // Get current local date/time string
                startDateInput.value = nowString; // Set Start Date input to current date/time

                // Only auto-fill End Date if it's also empty
                if (endDateInput && !endDateInput.value) {
                    endDateInput.value = getOneHourLaterString(nowString); // Set End Date to one hour later than Start Date
                }
            }
        });
    }

    // ========================================================
    // 4. Auto-update End Date when Start Date is Changed
    // ========================================================

    const startDateInput = document.getElementById('StartDateInput');
    const endDateInput = document.getElementById('EndDateInput');

    // if both inputs exist, add event listener to Start Date input
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', () => {

            const newEndString = getOneHourLaterString(startDateInput.value);

            if (newEndString) {
                endDateInput.value = newEndString; // Update End Date input to be one hour after new Start Date
            }
        });
    }

    // ========================================================
    // 5. Handle Event Details (View, Edit & Delete)
    // ========================================================

    // Variables to store current event details
    let currentEventId = null;
    let currentTitle = "";
    let currentLocation = "";
    let currentDescription = "";
    let currentType = "";
    let currentStartDate = "";
    let currentEndDate = "";

    // ============================================
    // View Event Details in Modal
    // ============================================

    const detailModal = document.getElementById('EventDetailModal');

    // When the modal opens, populate it with the event details
    if (detailModal) {
        detailModal.addEventListener('show.bs.modal', (event) => {
            // "relatedTarget" is the specific button that was clicked
            const button = event.relatedTarget; 
            
            // Extract info from the button's data-attributes
            // Note that these were set in the DisplayEvents() function in UpdateWebpage.js
            currentEventId = button.getAttribute('data-id'); 
            currentTitle = button.getAttribute('data-title');
            currentLocation = button.getAttribute('data-location');
            currentDescription = button.getAttribute('data-description');
            currentType = button.getAttribute('data-eventtype');
            currentStartDate = button.getAttribute('data-startdate');
            currentEndDate = button.getAttribute('data-enddate');

            // Format the time string for display
            const timeString = button.getAttribute('data-timestring');
        
            // Inject into the Modal HTML
            document.getElementById('DetailTitle').innerText = currentTitle;
            document.getElementById('DetailLocation').innerText = currentLocation || "Location TBC";
            document.getElementById('DetailDescription').innerText = currentDescription || "No description provided.";
            document.getElementById('DetailTime').innerText = timeString;
        });
    }

    // ============================================
    // Edit Event Button
    // ============================================

    const editButton = document.getElementById('EditEventButton');
        if (editButton) {
            editButton.addEventListener('click', () => {
                // Hide the detail modal
                const detailModalInstance = bootstrap.Modal.getInstance(detailModal);
                detailModalInstance.hide();

                // Update the input form with the current event details
                document.getElementById('TitleInput').value = currentTitle;
                document.getElementById('LocationInput').value = currentLocation;
                document.getElementById('DescriptionInput').value = currentDescription;
                document.getElementById('TypeInput').value = currentType;
                document.getElementById('StartDateInput').value = currentStartDate;
                document.getElementById('EndDateInput').value = currentEndDate;

                // Set the hidden event ID input to the current event's ID
                document.getElementById('EventIdInput').value = currentEventId;

                // Show the input modal
                const inputModalElement = document.getElementById('InputEventDetails');
                const inputModalInstance = new bootstrap.Modal(inputModalElement);
                inputModalInstance.show();
            });
        }

    // ============================================
    // Delete Event Button
    // ============================================

    // Handle Delete Button Click
    const deleteButton = document.getElementById('DeleteEventButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            if (!currentEventId) return; // No event selected (safety check)

            if(!confirm("Are you sure you want to delete this event?")) return; // Confirm deletion with the user

            try {
                const response = await deleteEvent(currentEventId); // Use the imported deleteEvent function

                if (response.ok) { // If deletion was successful
                    // Close the modal
                    const modalInstance = bootstrap.Modal.getInstance(detailModal);
                    modalInstance.hide();

                    // Refresh the event list
                    loadEvents();
                
                } else {
                    alert("Failed to delete event"); // Alert the user about the failure
                }
            } catch (error) {
                // Hide the modal manually
                const modalInstance = bootstrap.Modal.getInstance(detailModal);
                modalInstance.hide();

                // Show the "Connection Lost" error
                const container = document.getElementById("DisplayEvents");
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Connection Lost</h4>
                        <p>Could not delete event. The server seems to be offline.</p>
                        <hr>
                        <button id="retryButton(Delete)" class="btn btn-outline-danger btn-sm">Try Again</button>
                    </div>
                `;
                // Add event listener to the retry button to reload events when clicked
                document.getElementById('retryButton(Delete)').addEventListener('click', () => {
                    loadEvents();
                });    
            }
        }); // End of delete button click event listener
    } // End of if(deleteButton) check


    // ========================================================
    // 6. Handle Search Form Submission with Debouncing
    // ========================================================

    const searchInput = document.getElementById('SearchForm');
    let searchTimer; // Timer variable for debouncing

    if (searchInput) {
        searchInput.addEventListener('input', async (event) => {
            clearTimeout(searchTimer); // Clear the previous timer

            // setTimeout waits 300ms after the user stops typing to execute the search
            searchTimer = setTimeout(async () => {
                // Get the search query and trim whitespace
                const query = event.target.value.trim(); // event.target is the input field, .value is the current text inside it, .trim() removes whitespace
                    
                try {
                    const types = await fetchEventTypes(); // Fetch event types for displaying
                    
                    let events;
                    // If there's a search query, fetch matching events; otherwise, fetch all events
                    if (query) {
                        events = await fetchEventsByTitle(query); // Fetch events matching the search query
                    } else {
                        events = await fetchEvents(); // If query is empty, fetch all events
                    }
                    DisplayEvents(events, types); // Update the displayed events
                } catch (error) {
                    // IF SERVER IS DOWN: Show Error Message
                    container.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            <h4 class="alert-heading">Connection Lost</h4>
                            <p>Please restart the server and try again.</p>
                            <hr>
                            <button id="retryButton(SearchEvents)" class="btn btn-outline-danger btn-sm">Try Again</button>
                        </div>
                    `;
                    // Add event listener to the retry button to reload events when clicked
                    document.getElementById('retryButton(SearchEvents)').addEventListener('click', () => {
                        loadEvents(); // Retry loading events
                    });
                }
            }, 300); // Wait 300 milliseconds after the user stops typing
            // Debouncing prevents excessive server requests for fast typers
        });
    }

    // ========================================================
    // 7. Handle add Event Type Form Submission
    // ========================================================

    const newEventTypeForm = document.getElementById('NewEventTypeForm');

    if (newEventTypeForm) {
        newEventTypeForm.addEventListener('submit', async (event) => {
            // STOP the default browser behaviour (which is to reload the page immediately)
            event.preventDefault();

            // Get values from the form
            const name = document.getElementById('NewTypeName').value.trim(); // Trim whitespace and get name input
            const colour = document.getElementById('NewTypeColour').value; // Get colour input
            
            if  (!name || !colour) {
                alert("Please fill in all fields.");
                return; // If either field is empty, exit the function
            }

            const bootstrapColour = getBootstrapColour(colour); // Convert to Bootstrap colour class
            const newTypeData = {
                name: name,
                colour: bootstrapColour
            };

        // ========================================================
        // Send the Data to the Server using the FetchAPI.js module
        // ========================================================

            try {
                // Use the imported postEvent function to send data to the server
                const response = await postEventTypes(newTypeData);

                // Handle the Server's Response
                if (response.ok) { // If the response status is 200-299 (Success)

                    // Clear Form & Refresh Event Types in the dropdown
                    await loadEventTypes();
                    clearEventTypeFormInputs();

                    // Close the new event type modal
                    const modalElement = document.getElementById('AddEventTypeModal');
                    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement); // .getOrCreateInstance in case it wasn't initialized yet
                    modalInstance.hide(); // Hide the modal

                    // Switch back to the main modal after adding a new event type
                    const Mainmodal = document.getElementById('InputEventDetails'); // Get the DOM element for the main modal
                    const MainmodalInstance = bootstrap.Modal.getOrCreateInstance(Mainmodal); // Get the Bootstrap modal instance
                    MainmodalInstance.show(); // Show the main modal
                
                } else { // Alert the user about the failure
                    alert("Category name already exists!");
                }
            } catch (error) {
                // Hide the modal so the user can see the error message
                const modalElement = document.getElementById('AddEventTypeModal');
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalInstance.hide();
                
                // Show the "Connection Lost" error in the main container
                const container = document.getElementById("DisplayEvents");
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Connection Lost</h4>
                        <p>Could not save category. The server seems to be offline.</p>
                        <hr>
                        <button id="retryButton(AddType)" class="btn btn-outline-danger btn-sm">Try Again</button>
                    </div>
                `;
                // Add event listener to the retry button to reload events when clicked
                document.getElementById('retryButton(AddType)').addEventListener('click', () => {
                    loadEvents();
                });
            }
        }); // End of new event type form submit event listener
    };



}); // End of DOMContentLoaded event listener
