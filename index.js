const mqtt = require("mqtt");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { db } = require("./routes/firebase");
const app = express();
const PORT = process.env.PORT;
const router = require("./routes");

// MQTT
const brokerUrl = "mqtt://test.mosquitto.org:1883";
const topic = "topic_zahro";
const client = mqtt.connect(brokerUrl);
// subscribe to topic
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
  console.log(`${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);

  const data = {
    value: message.toString(),
    created_at: date.toLocaleString(),
  };
  // menyimpan di db
  db.collection("data")
    .add(data)
    .then((ref) => {
      console.log("Data berhasil ditambahkan: ", ref.id);
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
});

// OTHERS
const corsConfig = {
  credentials: true,
};
app.use(express.json());
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(router);
app.get("/api/sensor", async (req, res) => {
  const dataDb = db.collection("data");
  const response = await dataDb.get();
  let dataArray = [];
  response.forEach((doc) => {
    dataArray.push(doc.data());
  });
  dataArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.send(dataArray);
});
app.post("/api/publish", (req, res) => {
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

app.listen(PORT, () => {
  console.log("Server 🚀 on port", PORT);
});
