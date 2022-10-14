const express = require("express");
const app = express();
const subscriberModel = require("./models/subscribers");

app.use(express.json());

// Display the written message on the homepage to the client.
app.get("/", (req, res) => {
  res.json("Hello User!");
});

// 1. Get an array of all subscribers from the database
app.get("/subscribers", async (req, res) => {
  const subscribers = await subscriberModel.find().select("-__v");
  res.json(subscribers);
});

// 2. Get an array of subscriber's name and subscribed channel from the database
app.get("/subscribers/names", async (req, res) => {
  const subscribers = await subscriberModel
    .find()
    .select("-_id -subscribedDate -__v");
  res.json(subscribers);
});

// 3. Get a particular subscriber from the database using _id
app.get("/subscribers/:id", async (req, res) => {
  const id = req.params.id;

  await subscriberModel
    .findById(id)
    .select("-__v")
    .then((data) => {
      if (!data) {
        // When the subscriber is not found for the given id.
        error = Error(`Subscriber doesn't exist with the given _id: ${id}.`);
        res.status(400).json({ message: error.message });
      } else {
        res.json(data);
      }
    })
    .catch((error) => {
      // When the id is not entered in the correct format.
      res.status(400).json({
        message: `Subscriber doesn't exist with the given _id: ${id}.`,
      });
    });
});

// 4. Add a subscriber to the database and shows the added subscriber to the client.
app.post("/subscribers", async (req, res) => {
  const subscribers = new subscriberModel({
    name: req.body.name,
    subscribedChannel: req.body.subscribedChannel,
  });

  await subscribers
    .save()
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
});

// 5. Update a subscriber from the database using _id and shows the updated subscriber to the client.
app.put("/subscribers/:id", async (req, res) => {
  let upId = req.params.id;
  let upName = req.body.name;
  let upSubscribedChannel = req.body.subscribedChannel;

  await subscriberModel
    .findOneAndUpdate(
      { _id: upId },
      { $set: { name: upName, subscribedChannel: upSubscribedChannel } },
      { new: true }
    )
    .then((data) => {
      if (!data) {
        // When the subscriber is not present for the given id.
        error = Error(`Subscriber doesn't exist with the given _id: ${upId}.`);
        res.status(400).json({ message: error.message });
      } else {
        res.status(201).json(data);
      }
    })
    .catch((error) => {
      // When the id is not entered in the correct format.
      res.status(400).json({
        message: `Subscriber doesn't exist with the given _id: ${upId}.`,
      });
    });
});

// 6. Delete a subscriber from the database using _id and shows the deleted subscriber to the client.
app.delete("/subscribers/:id", async (req, res) => {
  const id = req.params.id;

  await subscriberModel
    .findByIdAndDelete({ _id: id })
    .then((data) => {
      if (!data) {
        // When the subscriber is not present for the given id.
        error = Error(`Subscriber doesn't exist with the given _id: ${id}.`);
        res.status(400).json({ message: error.message });
      } else {
        // Deleted data won't be shown to the client.
        res.json("Subscriber deleted successfully.");
      }
    })
    .catch((error) => {
      // When the id is not entered in the correct format.
      res.status(400).json({
        message: `Subscriber doesn't exist with the given _id: ${id}.`,
      });
    });
});

// Handles all the unwanted requests.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
