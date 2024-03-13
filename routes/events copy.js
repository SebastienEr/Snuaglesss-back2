/* require("dotenv").config(); // module .env
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
      // Chercher si un programme existe déjà avec les mêmes horaires
      Event.findOne({
        started_at: data.started_at,
        end_at: data.end_at,
      }).then((existingEvent) => {
        console.log(existingEvent);
        res.json({ data: existingEvent });
        // if (!existingEvent) {
        //   // S'il n'y a pas de programme existant, créer un nouveau programme
        //   const newEvent = new Event({
        //     artist: data.artist || null,
        //     title: data.title,
        //     album: data.album || null,
        //     started_at: new Date(data.started_at),
        //     end_at: new Date(data.end_at),
        //     duration: data.duration,
        //     is_live: data.is_live,
        //     cover: data.cover || null,
        //     default_cover: data.default_cover,
        //     forced_title: data.forced_title,
        //   });
        //   // Enregistrer le nouveau programme dans la base de données
        //   newEvent
        //     .save()
        //     .then((newEv) => {
        //       res.json({ result: true, event: newEv });
        //     })
        //     .catch((error) => {
        //       res.status(500).json({
        //         result: false,
        //         message: "Error saving the event.",
        //         error: error,
        //       });
        //     });
        // } else {
        //   // Si un programme existe déjà, renvoyer un message d'erreur
        //   res.json({
        //     result: false,
        //     message: "An event already exists for the given time frame.",
        //   });
        // }
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

/* router.get("/events", async (req, res) => {
  try {
    // Fetch the current track information
    const response = await fetch(
      "https://api.radioking.io/widget/radio/radio-snuagless/track/ckoi?limit=1"
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
}); */

/* module.exports = router;  */
