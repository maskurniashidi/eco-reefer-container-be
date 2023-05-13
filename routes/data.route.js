const express = require("express");
const dataRouter = express.Router();
const mqtt = require("mqtt");
const { db } = require("./firebase");
const Sensor = require("../models/Sensor");
const setNotification = require("../models/SetNotification");
const listNotification = require("../models/ListNotification");
// MQTT
const brokerUrl = "mqtt://103.162.253.243:1883";
const topic = "RC_20FT_1";
const client = mqtt.connect(brokerUrl, {
  username: "refe",
  password: "Tr4N5F0Rm3R",
});

dataRouter.get("/data-sensor", async (req, res) => {
  try {
    const sensors = await Sensor.findAll();
    if (sensors.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }
    res.json(sensors);
  } catch (error) {
    res.status(400).json({ error });
  }
});

dataRouter.post("/data-sensor", async (req, res) => {
  try {
    const { value, dateInsert } = req.body;
    const sensor = await Sensor.create({ value, dateInsert });
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ error });
  }
});

dataRouter.post("/data-publish", (req, res) => {
  // publish a message to the topic
  console.log(req.body);
  const message = req.body.message;

  client.publish(topic, message, (err) => {
    if (err) {
      console.log("error publising message", err);
      res.status(500).send("error publising message");
    } else {
      res.status(200).send("message published");
    }
  });
});

dataRouter.get("/set-notifikasi/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await setNotification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error });
  }
});

dataRouter.put("/set-notifikasi/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { minimum, maximum } = req.body;
    const notification = await setNotification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    notification.minimum = minimum;
    notification.maximum = maximum;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error });
  }
});

dataRouter.get("/list-notifikasi", async (req, res) => {
  try {
    const notifications = await listNotification.findAll();
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error });
  }
});

dataRouter.post("/list-notifikasi", async (req, res) => {
  try {
    const { message } = req.body;
    const notification = await listNotification.create({ message });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// dataRouter.get("/data-sensor", async (req, res) => {
//   const dataDb = db.collection("data");
//   const response = await dataDb.get();
//   let dataArray = [];
//   response.forEach((doc) => {
//     dataArray.push(doc.data());
//   });
//   dataArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
//   res.send(dataArray);
// });

// dataRouter.patch("/set-notifikasi/:id", async (req, res) => {
//   const data = await req.body;
//   const notification = db.collection("setNotification").doc(req.params.id);
//   await notification.update({
//     minimum: data.minimum,
//     maximum: data.maximum,
//   });
//   res.status(201).json({
//     message: "Notification Value Updated",
//   });
// });

// dataRouter.get("/set-notifikasi", async (req, res) => {
//   const dataDb = db.collection("setNotification");
//   const response = await dataDb.get();
//   let dataArray = [];
//   response.forEach((doc) => {
//     dataArray.push(doc.data());
//   });
//   res.send(dataArray);
// });

// dataRouter.post("/list-notifikasi", async (req, res) => {
//   const date = new Date();
//   const data = {
//     value: req.body.value,
//     createdAt: date.toLocaleString(),
//   };
//   // Menambahkan data ke Firestore
//   db.collection("listNotification")
//     .add(data)
//     .then((ref) => {
//       console.log("Data added with ID:", ref.id);
//       res.send("Notification added successfully.");
//     })
//     .catch((error) => {
//       console.error("Error adding data:", error);
//       res.status(500).send("Error adding Notification.");
//     });
// });

// dataRouter.get("/list-notifikasi", async (req, res) => {
//   const dataDb = db.collection("listNotification");
//   const response = await dataDb.get();
//   let dataArray = [];
//   response.forEach((doc) => {
//     dataArray.push(doc.data());
//   });
//   dataArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//   res.send(dataArray);
// });

module.exports = dataRouter;
