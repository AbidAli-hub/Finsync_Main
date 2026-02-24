// Debug what the frontend is actually sending
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Debug endpoint to see what data is being sent
app.post('/api/auth/register', (req, res) => {
  console.log('Received registration request:');
  console.log('- Request body:', req.body);
  console.log('- Request body type:', typeof req.body);
  console.log('- Email field:', req.body.email, typeof req.body.email);
  console.log('- Name field:', req.body.name, typeof req.body.name);
  console.log('- Password field:', req.body.password, typeof req.body.password);
  
  res.status(200).json({ message: 'Debug received', data: req.body });
});

app.listen(PORT, () => {
  console.log(`Debug server running on http://localhost:${PORT}`);
});