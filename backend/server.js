const express = require('express');
const app = express();

app.use(express.json());

// Placeholder for routes (to be added based on serverold.js)
app.get('/', (req, res) => res.send('Backend is running'));

// Match Render's port or local testing
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
