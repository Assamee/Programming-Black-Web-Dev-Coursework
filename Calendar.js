// Accessing the users inputs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Access HTML Elements
    const titleInput = document.getElementById("TitleInput");
    const descriptionInput = document.getElementById("DescriptionInput");
    const LocationInput = document.getElementById("LocationInput");
    const startdateInput = document.getElementById("StartDateInput");
    const enddateInput = document.getElementById("EndDateInput");
    const saveButton = document.getElementById("SaveEventButton");

    // Event Listener for Save Button
    saveButton.addEventListener("click", () => {
        const title = titleInput.value;
        const description = descriptionInput.value;
        const location = LocationInput.value;
        const startDate = startdateInput.value;
        const endDate = enddateInput.value;

        





    })



    // End of all code
})