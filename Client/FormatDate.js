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
    return rawDateString.toLocaleDateString('en-GB', { 
        month: 'short', // "Jan"
        day: 'numeric'  // "14"
    });
}

// --- Extracts "MON, 1 JAN" for the Date Header ---
export function formatDateHeader(rawDateString) {
    // Turn the raw date string into a Date object
    const date = new Date(rawDateString);
    // Formating the Date Header (Uk format)
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',  // "Mon"
        day: 'numeric',    // "1"
        month: 'short',    // "Jan"
    }).toUpperCase(); // "MON, 1 JAN"
}