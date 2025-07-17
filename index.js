const express = require('express');
const { urlencoded } = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');

const app = express();

// Middleware
app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const VoiceResponse = twilio.twiml.VoiceResponse;
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_API_KEY, TWILIO_API_SECRET, TWIML_APP_SID } = process.env;

// Initialize Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Generate capability token for browser calling
app.get('/token', (req, res) => {
  try {
    const capability = new twilio.jwt.ClientCapability({
      accountSid: TWILIO_ACCOUNT_SID,
      authToken: TWILIO_AUTH_TOKEN,
    });
    
    // Allow outgoing calls
    capability.addScope(
      new twilio.jwt.ClientCapability.OutgoingClientScope({ 
        applicationSid: TWIML_APP_SID 
      })
    );
    
    // Allow incoming calls
    capability.addScope(
      new twilio.jwt.ClientCapability.IncomingClientScope('browser')
    );
    
    const token = capability.toJwt();
    res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Handle voice call routing
app.post('/voice', (req, res) => {
  try {
    const twiml = new VoiceResponse();
    const toNumber = req.body.To;
    
    console.log(`Incoming call request to: ${toNumber}`);
    
    // Validate phone number format
    if (!toNumber || !toNumber.startsWith('+')) {
      twiml.say('Invalid phone number format. Please use international format starting with plus.');
      res.type('text/xml');
      res.send(twiml.toString());
      return;
    }
    
    // Create dial instruction
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // Replace with your Twilio number
      timeout: 30,
      record: 'record-from-ringing-dual'
    });
    
    dial.number(toNumber);
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling voice call:', error);
    const twiml = new VoiceResponse();
    twiml.say('An error occurred while processing your call.');
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// Handle call status updates
app.post('/status', (req, res) => {
  console.log('Call status update:', req.body);
  res.status(200).send('OK');
});

// API endpoint to make calls programmatically
app.post('/api/call', async (req, res) => {
  try {
    const { to, from } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const call = await client.calls.create({
      to: to,
      from: from || process.env.TWILIO_PHONE_NUMBER,
      url: `${req.protocol}://${req.get('host')}/voice`,
      statusCallback: `${req.protocol}://${req.get('host')}/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });
    
    res.json({ 
      success: true, 
      callSid: call.sid,
      message: 'Call initiated successfully' 
    });
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ 
      error: 'Failed to make call', 
      details: error.message 
    });
  }
});

// Get call logs
app.get('/api/calls', async (req, res) => {
  try {
    const calls = await client.calls.list({ limit: 20 });
    res.json(calls.map(call => ({
      sid: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      startTime: call.startTime,
      endTime: call.endTime,
      duration: call.duration
    })));
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Access your app at: http://localhost:${PORT}`);
});
