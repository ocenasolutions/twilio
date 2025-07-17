require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");
const path = require("path"); 

const app = express();
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

app.post("/call", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || !phoneNumber.startsWith("+")) {
    return res.status(400).json({ error: "Invalid phone number. Use +<countrycode><number> format." });
  }

  try {
    const call = await client.calls.create({
      from: twilioNumber,
      to: phoneNumber,
      twiml: "<Response><Say>This is a call from your app using Twilio. Goodbye!</Say></Response>",
    });

    res.json({ message: "Call started", sid: call.sid });
  } catch (error) {
    console.error("Twilio error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
