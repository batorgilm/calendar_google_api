const express = require("express");
const { google } = require("googleapis");
const axios = require("axios");
const dayjs = require("dayjs");
const { v4 } = require("uuid");
const { JWT } = require("google-auth-library");
const app = express();

const PORT = 8000;
const API_KEY = "AIzaSyAGmByx7U88pQo2HomC3aoyYkgNh0NrQek";
const CLIENT_ID =
  "271970244731-36ac2pmfvbl2tt0aebkj63nmke0rp8ev.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URL = "http://localhost:8000/google/redirect";
const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
const jwtClient = new JWT({
  keyFile: "./service_credentials.json",
  scopes: scopes,
  clientOptions: {
    subject: "orgil0588@gmail.com",
  },
});

const calendar = google.calendar({
  version: "v3",
  auth: jwtClient,
});

app.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log(tokens);
  res.redirect("/schedule_event");
});

app.get("/schedule_event", async (req, res) => {
  await calendar.events.insert({
    auth: jwtClient,
    calendarId: "primary",
    conferenceDataVersion: 1,
    maxAttendees: 2,
    sendNotifications: true,
    sendUpdates: "all",
    supportsAttachments: true,
    requestBody: {
      summary: "Test",
      description: "test desc",
      start: {
        dateTime: dayjs(new Date()).add(3, "day").toISOString(),
        timeZone: "Asia/Ulaanbaatar",
      },
      end: {
        dateTime: dayjs(new Date()).add(3, "day").add(2, "hour").toISOString(),
        timeZone: "Asia/Ulaanbaatar",
      },
      conferenceData: {
        conferenceSolution: {
          name: "Hangout",
        },
        createRequest: {
          requestId: v4(),
        },
      },
      attendees: [
        {
          email: "orgil0588@gmail.com",
        },
      ],
    },
  });

  res.send({
    msg: "done",
  });
});

app.get("/google/redirect", (req, res) => {
  res.send("its work");
});

app.listen(PORT, () => {
  console.log("Server started on port ", PORT);
});
