const eventForm = document.getElementById('newEventForm');

eventForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Stop the page from reloading

    // 1. Gather data using the name attributes from HTML
    const formData = new FormData(eventForm);
    
    // 2. Convert to JSON object
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));
    
    console.log("Sending data:", formJSON);

    // 3. Send via Fetch (simulating the image logic)
    /* const response = await fetch('/events/new', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: formJSON
    });
    
    if (response.ok) {
        // Close the modal via JS here if successful
        const modalElement = document.getElementById('InputEventDetails');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    }
    */
});