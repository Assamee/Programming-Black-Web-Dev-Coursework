// Function to add event to the timeline display
function addEventToTimeline(event) {
    // ID of the HTML container where events will be displayed
    const displayContainer = document.getElementById("DisplayEvents");

    // Create Event item
    const eventItem = document.createElement("li"); // Create a list item for the event    
    eventItem.className = "list-group-item d-flex justify-content-between align-items-start"; // Add Bootstrap list group item classes

    // Need to finish this function (and remove the old one below)


}

// Function to add event to the timeline display
function addEventToTimeline(event) {
    // ID of the HTML container where events will be displayed
    const displayContainer = document.getElementById("DisplayEvents");

    // Create Event Card
    const eventCard = document.createElement("div"); // Create a div for the event card    
    eventCard.className = "card mb-3 text-start w-100 shadow-sm border-0"; // Add Bootstrap card classes

    // Create the body wrapper
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

        // Create Title
        const titleElement = document.createElement("h5");
        titleElement.className = "card-title";
        titleElement.textContent = event.title; // Browser treats this as text, preventing XSS attacks (malicious code injection)
        
        // Create Date Range
        const dateElement = document.createElement("h6");
        // Format the start and end date (with helper function)
        const start = formatDate(event.startDate); 
        const end = formatDate(event.endDate);
        dateElement.className = "card-subtitle mb-2 text-muted";
        dateElement.textContent = `From ${start} To: ${end}`;

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