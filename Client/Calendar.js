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
            // Loop through each event and add it to the timeline display on the HTML webpage
            events.forEach(event => { 
                addEventToTimeline(event); // Call the function to display each event
            });
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
            if (response.ok) {
                // If the response is OK (status 200-299), add the event to the timeline display
                addEventToTimeline(newEvent);
                clearFormInputs(); // Clear the modal input fields after saving
            } else {
                alert("Failed to save event. Please try again."); // Alert user if saving failed
            }
        // .catch() to handle any errors that occur during the fetch request (e.g. server is switched off)
        }).catch(error => console.error("Error:", error));
        


    }); // End of Save Button event listener

}); // End of DOMContentLoaded event listener
// Functions outside the DOMContentLoaded event listener are only called inside it

// Function to add event to the timeline display
function addEventToTimeline(event) {
    // ID of the HTML container where events will be displayed
    const displayContainer = document.getElementById("DisplayEvents");

    // Create Event Card
    const eventCard = document.createElement("div"); // Create a div for the event card    
    eventCard.className = "card mb-3 text-start w-100 shadow-sm"; // Add Bootstrap card classes

    // Create the body wrapper
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

        // Create Title
        const titleElement = document.createElement("h5");
        titleElement.className = "card-title";
        titleElement.textContent = event.title; // Browser treats this as text, preventing XSS attacks (malicious code injection)
        
        // Create Date Range
        const dateElement = document.createElement("h6");
        dateElement.className = "card-subtitle mb-2 text-muted";
        dateElement.textContent = `From ${event.startDate} To: ${event.endDate}`;

        // Create Description
        const descriptionElement = document.createElement("p"); // Create a paragraph for description
        descriptionElement.className = "card-text"; // Add Bootstrap card-text class
        descriptionElement.textContent = event.description; // 

        // Create Location
        const locationElement = document.createElement("p");
        locationElement.className = "card-text text-muted small";
        locationElement.textContent = `📍 ${event.location}`;

    // Append all elements to the card body
    cardBody.appendChild(titleElement);
    cardBody.appendChild(dateElement);
    cardBody.appendChild(descriptionElement);
    cardBody.appendChild(locationElement);

    // Append the card body to the event card
    eventCard.appendChild(cardBody);
    // Add the event card to the display container
    displayContainer.appendChild(eventCard);
}

// Function to clear the modal input fields
function clearFormInputs() {
    document.getElementById("TitleInput").value = '';
    document.getElementById("DescriptionInput").value = '';
    document.getElementById("LocationInput").value = '';
    document.getElementById("StartDateInput").value = '';
    document.getElementById("EndDateInput").value = '';
}