const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { twiml: { VoiceResponse } } = require('twilio');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

app.post('/call', async (req, res) => {
  const { fromNumber, toNumber } = req.body;

  try {
    const call = await client.calls.create({
      twiml: `<Response><Dial>${toNumber}</Dial></Response>`,
      to: fromNumber,
      from: process.env.TWILIO_PHONE
    });

    res.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error('Call error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
