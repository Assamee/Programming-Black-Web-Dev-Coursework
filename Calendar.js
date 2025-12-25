// Accessing the users inputs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Array to store events
    const events = []; // Outside of the click listener so it isnt reset on every click

    // Access HTML Elements
    const titleInput = document.getElementById("TitleInput");
    const descriptionInput = document.getElementById("DescriptionInput");
    const locationInput = document.getElementById("LocationInput");
    const startdateInput = document.getElementById("StartDateInput");
    const enddateInput = document.getElementById("EndDateInput");
    const saveButton = document.getElementById("SaveEventButton");
    const DisplayEvents = document.getElementById("DisplayEvents");

    // Event Listener for Save Button
    saveButton.addEventListener("click", () => {
        const title = titleInput.value;
        const description = descriptionInput.value;
        const location = locationInput.value;
        const startDate = startdateInput.value;
        const endDate = enddateInput.value;

        // Put the data for each event into an Object
        const event = {
            id: Date.now(), // Unique ID based on timestamp
            title: title,
            description: description,
            location: location,
            startDate: startDate,
            endDate: endDate
        };

        // Add the event object to the events array
        events.push(event); // Add the new event object to the events array

        console.log(events); // Log the events array to the console for debugging

        // Create Event Card
        const eventCard = document.createElement("div"); // Create a div for the event card
        eventCard.classList.add("card", "mb-3", "shadow-sm"); // Add Bootstrap card classes

        
        // .innerHTML to add HTML content to the event card
        // ` is used for template literals to embed variables (Like f-strings in Python)
        eventCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${location}</h6>
                <p class="card-text">${description}</p>
                <p class="card-text"><small class="text-muted">From: ${startDate} To: ${endDate}</small></p>
            </div>
        `;

        // Append the event card to the display container
        DisplayEvents.appendChild(eventCard);
    })



    



    // End of all code
})
