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

  // Mengambil informasi tanggal dan waktu dari objek Date
  const year = date.getUTCFullYear();
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
  const day = ("0" + date.getUTCDate()).slice(-2);
  const hours = ("0" + (date.getUTCHours() + 7)).slice(-2);
  const minutes = ("0" + date.getUTCMinutes()).slice(-2);
  const seconds = ("0" + date.getUTCSeconds()).slice(-2);
  // temp1#temp2#temp3#arus#tegangan#daya#status#setPoint
  // Menggabungkan informasi tanggal dan waktu dalam format yang diinginkan
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}Z`;
  console.log(formattedDateTime);
  const data = {
    value: message.toString(),
    created_at: formattedDateTime,
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
