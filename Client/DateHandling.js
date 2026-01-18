//Client/DateHandling.js
// === This module contains functions for formatting dates and times, as well as date-related calculations ===

// ==========================================
// Date and Time Formatting Functions
// ==========================================

// --- Extracts "09:00" ---
export function formatTime(rawDateString) {
    const date = new Date(rawDateString); // Convert String to Date Object
    return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// --- Extracts "Jan 14" ---
export function formatShortDate(rawDateString) {
    const date = new Date(rawDateString); // Convert String to Date Object
    return date.toLocaleDateString('en-GB', { 
        month: 'short', // "Jan"
        day: 'numeric'  // "14"
    });
}

// --- Extracts "MON, 1 JAN" for the Date Header ---
export function formatDateHeader(rawDateString) {
    const date = new Date(rawDateString); // Turn the raw date string into a Date object
    return date.toLocaleDateString('en-GB', { // Formating the Date Header (Uk format)
        weekday: 'short',  // "Mon"
        day: 'numeric',    // "1"
        month: 'short',    // "Jan"
    }).toUpperCase(); // "MON, 1 JAN"
}

// ==========================================
// Date Logic & Calculations
// ==========================================

// Returns the current local time string for input fields ('YYYY-MM-DDTHH:MM')
export function getLocalNowString() {
    const now = new Date(); // Get current date and time
    // Adjust for timezone
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:MM'
}

// Given a start date string, returns a string for one hour later in 'YYYY-MM-DDTHH:MM' format
export function getOneHourLaterString(startDateString) {
    const start = new Date(startDateString); // Convert to Date object
    
    // Check if start date is valid
    if (isNaN(start.getTime())) return "";

    const end = new Date(start); // Create a new Date object for the end time
    end.setHours(start.getHours() + 1); // Add one hour to the start time
    
    // ADJUST FOR TIMEZONES
    end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
    
    return end.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:MM'
}