// Accessing the users inputs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    // Access the Save Button HTML Element (inside the DOM)
    const saveButton = document.getElementById("SaveEventButton");

    // Event Listener for Save Button
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

        // Call a funtion to display the event on the page
        addEventToTimeline(newEvent);

        // Clear the modal input fields after saving
        clearFormInputs();
    });
});

// Function to add event to the timeline display
function addEventToTimeline(event) {
    const displayContainer = document.getElementById("DisplayEvents");

    // Create Event Card
    const eventCard = document.createElement("div"); // Create a div for the event card    
    eventCard.className = "card mb-3 text-start w-100 shadow-sm"; // Add Bootstrap card classes

    // .innerHTML to add HTML content to the event card
    // ` (Backtick) is used for template literals to embed variables (Like f-strings in Python)
    eventCard.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted"> ${event.startDate} To: ${event.endDate}</h6>
            <p class="card-text">${event.description}</p>
            <p class="card-text"><small class="text-muted">📍 ${event.location}</small></p>
        </div>
    `;

    // Add the event card to the display container
    DisplayEvents.appendChild(eventCard);
}

// Function to clear the modal input fields
function clearFormInputs() {
    document.getElementById("TitleInput").value = '';
    document.getElementById("DescriptionInput").value = '';
    document.getElementById("LocationInput").value = '';
    document.getElementById("StartDateInput").value = '';
    document.getElementById("EndDateInput").value = '';
}