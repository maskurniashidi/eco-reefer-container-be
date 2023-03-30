const mqtt = require("mqtt");
const express = require("express");
const router = express.Router();
const authRouter = require("./auth.route");
const dataRouter = require("./data.route");
const { db } = require("./firebase");
// MQTT
const brokerUrl = "mqtt://test.mosquitto.org:1883";
const topic = "topic_zahro";
const client = mqtt.connect(brokerUrl);
// TOPIC 1
client.on("connect", () => {
  client.subscribe(topic, (err) => {
    if (err) {
      console.log("error subscribing to topic: ", err);
    } else {
      console.log("subsribe to topic", topic);
    }
  });
});

client.on("message", (topic, message) => {
  const date = new Date();
  const data = {
    value: message.toString(),
    created_at: date.toLocaleString(),
  };
  const numPagar = data.value.split("#").length - 1;
  if (numPagar > 2) {
    db.collection("data")
      .add(data)
      .then((ref) => {
        console.log("Data berhasil ditambahkan: ", ref.id);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  } else {
    db.collection("dataPublish")
      .add(data)
      .then((ref) => {
        console.log("Data berhasil ditambahkan: ", ref.id);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  }
});

router.get("/", (req, res) => {
  res.send("Selamat Datang di Express JS");
});
router.use("/api/auth", authRouter);
router.use("/api", dataRouter);

module.exports = router;
