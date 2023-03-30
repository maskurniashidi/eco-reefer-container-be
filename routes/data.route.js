const express = require("express");
const dataRouter = express.Router();
const mqtt = require("mqtt");
const { db } = require("./firebase");
// MQTT
const brokerUrl = "mqtt://test.mosquitto.org:1883";
const topic = "topic_zahro";
const client = mqtt.connect(brokerUrl);

dataRouter.get("/data-sensor", async (req, res) => {
  const dataDb = db.collection("data");
  const response = await dataDb.get();
  let dataArray = [];
  response.forEach((doc) => {
    dataArray.push(doc.data());
  });
  dataArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.send(dataArray);
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

dataRouter.patch("/set-notifikasi/:id", async (req, res) => {
  const data = await req.body;
  const notification = db.collection("setNotification").doc(req.params.id);
  await notification.update({
    minimum: data.minimum,
    maximum: data.maximum,
  });
  res.status(201).json({
    message: "Notification Value Updated",
  });
});

dataRouter.get("/set-notifikasi", async (req, res) => {
  const dataDb = db.collection("setNotification");
  const response = await dataDb.get();
  let dataArray = [];
  response.forEach((doc) => {
    dataArray.push(doc.data());
  });
  res.send(dataArray);
});

dataRouter.post("/list-notifikasi", async (req, res) => {
  const date = new Date();
  const data = {
    value: req.body.value,
    createdAt: date.toLocaleString(),
  };
  // Menambahkan data ke Firestore
  db.collection("listNotification")
    .add(data)
    .then((ref) => {
      console.log("Data added with ID:", ref.id);
      res.send("Notification added successfully.");
    })
    .catch((error) => {
      console.error("Error adding data:", error);
      res.status(500).send("Error adding Notification.");
    });
});

dataRouter.get("/list-notifikasi", async (req, res) => {
  const dataDb = db.collection("listNotification");
  const response = await dataDb.get();
  let dataArray = [];
  response.forEach((doc) => {
    dataArray.push(doc.data());
  });
  dataArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.send(dataArray);
});

module.exports = dataRouter;
