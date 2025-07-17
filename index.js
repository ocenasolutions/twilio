const express = require('express');
const { urlencoded } = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const VoiceResponse = twilio.twiml.VoiceResponse;

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_API_KEY, TWILIO_API_SECRET, TWIML_APP_SID } = process.env;

// Generate capability token
app.get('/token', (req, res) => {
  const capability = new twilio.jwt.ClientCapability({
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
  });

  capability.addScope(
    new twilio.jwt.ClientCapability.OutgoingClientScope({ applicationSid: TWIML_APP_SID })
  );
  capability.addScope(new twilio.jwt.ClientCapability.IncomingClientScope('browser'));

  res.send({ token: capability.toJwt() });
});

// Handle voice call
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();
  const dial = twiml.dial();
  dial.number(req.body.To);
  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
