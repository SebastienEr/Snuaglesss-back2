require("dotenv").config(); // module .env
var express = require("express");
var router = express.Router();

const Event = require("../models/events"); // model event

router.get("/getevents", (req, res) => {
  //évènements en BDD
  Event.find()
    .then((data) => {
      res.json({ result: true, programmes: data });
    })
    .catch((error) => {
      res.status(500).json({
        result: false,
        message: "An error occurred while fetching the events.",
        error: error,
      });
    });
});

router.post("/events", (req, res) => {
  // envoyer des titres/programmes en BDD
  fetch(
    "https://api.radioking.io/widget/radio/radio-snuagless/track/ckoi?limit=1"
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      Event.findOne({
        started_at: data.started_at,
        end_at: data.end_at,
      }).then((existingEvent) => {
        if (!existingEvent) {
          const newEvent = new Event({
            artist: data[0].artist,
            title: data[0].title,
            album: data[0].album,
            started_at: data[0].started_at,
            end_at: data[0].end_at,
            duration: data[0].duration,
            is_live: data[0].is_live,
            cover: data[0].cover,
            default_cover: data[0].default_cover,
            forced_title: data[0].forced_title,
          });
          // Enregistrer le nouveau programme dans la base de données
          newEvent
            .save()
            .then((newEv) => {
              res.json({ result: true, event: newEv });
            })
            .catch((error) => {
              res.status(500).json({
                result: false,
                message: "Error saving the event.",
                error: error,
              });
            });
        }
      });
    })
    .catch((error) => {
      res.status(500).json({
        result: false,
        message: "Error fetching data from the API.",
        error: error,
      });
    });
});

router.get("/eventsByHour", async (req, res) => {
  try {
    // Fetch the current track information
    const response = await fetch(
      "https://api.radioking.io/widget/radio/radio-snuagless/track/ckoi?limit=96"
    );
    const track = await response.json();

    // Find the event with the matching start and end times
    const prog = await Event.findOne({
      startedAt: track.started_at,
      endAt: track.end_at,
    });

    // If an event is found, send it back in the response
    if (prog) {
      res.json({ result: true, event: prog });
    } else {
      res.json({
        result: false,
        message: "No event found for the given time frame.",
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: "An error occurred while fetching the event.",
    });
  }
});

module.exports = router;
