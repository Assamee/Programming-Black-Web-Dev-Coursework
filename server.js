// Import the Express app defined in app.js
const app = require('./app');

const PORT = 3000; // Define the port number

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
