//Client/Calendar.js
// === Main Client-Side JavaScript for Calendar Application ===

// Import necessary functions from other modules
import { getLocalNowString, getOneHourLaterString } from './DateHandling.js';
import { DisplayEvents, updateNavbarHeight, clearFormInputs } from './UpdateWebpage.js';
import { fetchEvents, postEvent, deleteEvent } from './fetchAPI.js';

// Accessing the DOM after it is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // UI Setup
    updateNavbarHeight(); // Initial call to set navbar height CSS variable
    window.addEventListener('resize', updateNavbarHeight); // Update navbar height CSS variable on window resize

    // ========================================================
    // 1. Load Events using the FetchAPI.js module 
    // ========================================================

    // Using an async function to use 'await' keyword inside it
    async function loadEvents() {
        let events = await fetchEvents(); // Use the imported fetchEvents function to get events
        events = events.filter(event => event.title); // Filter out events without a title
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
                clearFormInputs();
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
    // 5. Handle Event Details (View & Delete)
    // ========================================================

    let currentEventId = null; // Store the ID of the event currently being viewed
    const detailModal = document.getElementById('EventDetailModal');

    // When the modal opens, populate it with the event details
    if (detailModal) {
        detailModal.addEventListener('show.bs.modal', (event) => {
            // "relatedTarget" is the specific button that was clicked
            const button = event.relatedTarget; 
            
            // Extract info from the button's data-attributes
            currentEventId = button.getAttribute('data-id'); 
            const title = button.getAttribute('data-title');
            const location = button.getAttribute('data-location');
            const description = button.getAttribute('data-description');
            const timeString = button.getAttribute('data-timestring');
        
            // Inject into the Modal HTML
            document.getElementById('DetailTitle').innerText = title;
            document.getElementById('DetailLocation').innerText = location;
            document.getElementById('DetailDescription').innerText = description || "No description provided.";
            document.getElementById('DetailTime').innerText = timeString;
        });
    }


    // Handle Delete Button Click
    const deleteButton = document.getElementById('DeleteEventButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            if (!currentEventId) return; // No event selected (safety check)

            if(!confirm("Are you sure you want to delete this event?")) return; // Confirm deletion with the user

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
        }); // End of delete button click event listener
    } // End of if(deleteButton) check




}); // End of DOMContentLoaded event listener
