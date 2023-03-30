import express from "express";
import mqtt from "mqtt";
import admin from "firebase-admin";

const app = express();
const port = 3001;
const brokerUrl = "mqtt://test.mosquitto.org:1883";
const topic = "topic_zahro";

// connect to db
const serviceAccount = {
type: "service_account",
project_id: "dev-eco-reefer",
private_key_id: "f173552e891c5c91f8af94059afded989c1ebd90",
private_key:
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoiUKvMtnH5NIw\nhNKyzMPihI7oXzPF5a/c6N6nWW58rqwrXVL/0Lq99tbcm1xKjqAy4rCduTdNuS84\nPWt0VFPzTLaDm/S2zeggKBKGL5Vg+VXGeXa/ZD+oQ8jiiOgt7CoQ5QP2YgQmVSLC\nc0gRLltukr11mXR9oDmRXq/u7tpM2z9rRLF9393fE7rKG0FNMkUe3ed9eSQdN+nJ\n4AxjqKhZ5l8cNSNDBa+vJQFQpPYwe95vtdJsoKGSQfBJdJUSGCc+GLi5PV31fNDi\n5wM+IyMQC+w8+PqGg02CodWvbn0kcVeC2IoK+aVlnWnJoZ2sBH0Lp12OVG1Ywf+N\no5jUe1R3AgMBAAECggEAAKe6ndv3v6mGLXCN3D/dF/mQnf5sTzbBCwwItgBIq5CH\nKbVT8rgzkaYnra5R06Rf27nlNv0WyZ4CWYpmQKcwKUAWinGNGeIp7dqEsbH2U+z1\n/y7AlxhVAiHlxerKjvJBiPFHbI2r4jx87/6VoCN5ODBFLyxoxWoIYQm9wK976nDK\nIVM6zsBj2lJPdIS/33T21rl89Z8AEYc5oS6oO+18im8cQWSLlSS8ktGQvh8NQlpr\nBkTD4zV0v2DdArtD7S9BEfbQzcwKPqzjdh0834RsSu1K8hYIo0aZEQIbpCRZZ3U4\n/4+yGPSfOQ8uI223TgEKkBHgBV8TN0Z/0u7unXNhqQKBgQDuOiwHFEXFXQbDCTCI\nsUXodAWQloLCnnO/WMeXXNnRgB8t2uWjKxX6SEUntbio1hPiS1So7TbzKANfJkvg\nfVrigu/b5YysdJbiFg6LkpfLDKz4S0Rxle1RgcQ0CU/Z53T8AXAlJU8Om/DXHZVW\n3FOMV2aHYfxiSWKcMm6pbCDyuwKBgQC1HBSf79KmeWbXqQrti1chsnF/blDKIgep\n3W/nGPOoX/1ttQ//52KmxtxFi3/ZK9cGumrUc3TjuVgwaf+9nmHpL9SxVwdmGEPp\nU63VBwSrK94hyMCli2w4drLHBZXFe8UU8LCGLr2AOJQJL0OyYe6rCcd/9adHVKei\nOUnudvtfdQKBgQCvuwmvTy0Ioc7TIHxE2UAQcUWJmv1qQyhvBjZ1WXD0MebOFKNA\n8g+MSLN6z3ogUYrpa1hQJGxcgi+6iK2AM/hPDveQ5owWywpiTJL+Mmz2w6r0ndEn\nWMlvTqJFIHle7HZHT2hCfnsK8819Yb1ADdczt2VSiN18Q1YSksE/CRxk8QKBgFe8\nFrGz+BP1U8C9fzG8AqWsUBcvVavV+GhtgTwudjrm5Vo0EGAjs0Kfqy11eqW1+yCj\nRgVNOR7oNrSdZOpyw3O3XA3c3xSyRJPPmbJNCBHz2lP7cHfBptdjiQ+owPk+ECco\nwhr+oYZv4ibg4qaTko8A2cg/NJ31gI+xuQLwWK3RAoGAZ30Sdhhfqs/v+BeIIfia\nWyN0oN2MxToFW6BtFA83V0iExKmdiMiAHyDj4A8tmZWkbgwk2G/B5S2F8X5fLySH\nh02Bdsx3kOVH3qdhfQcJwnngJ4sFFIJvvtsQVgU18pU2D7dhplK9NZqaBawCT3KY\nT3K7skdgMDpI0uujxwRpdW8=\n-----END PRIVATE KEY-----\n",
client_email: "firebase-adminsdk-dm0hn@dev-eco-reefer.iam.gserviceaccount.com",
client_id: "101441635831708863068",
auth_uri: "https://accounts.google.com/o/oauth2/auth",
token_uri: "https://oauth2.googleapis.com/token",
auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dm0hn%40dev-eco-reefer.iam.gserviceaccount.com",
};

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://dev-eco-reefer.firebaseio.com",
});

const db = admin.firestore();

// middleware untuk mengurai body JSON
app.use(express.json());

// middleware untuk mengurai body URL encoded
app.use(express.urlencoded({ extended: true }));

// create mqtt client
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
const dataString = message.toString();
console.log("received message : ", dataString);
const dataJson = dataString;

const data = {
value: dataJson,
created_at: Date.now(),
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

app.get("/", (req, res) => {
res.send("hello world");
});

app.post("/publish", (req, res) => {
// publish a message to the topic
console.log(req);
const message = req.body.message;

client.publish(topic, message, (err) => {
if (err) {
console.log("error publising message", err);
res.status(500).send("error publising message");
} else {
console.log("message published", message);
res.status(200).send("message published");
}
});
});

app.get("/data", (req, res) => {
db.collection("data")
.get()
.then((querySnapshot) => {
const data = [];
querySnapshot.forEach((doc) => {
data.push(doc.data());
});
res.json(data);
})
.catch((error) => {
console.error("Error mengambil data dari Firestore: ", error);
res.status(500).send("Terjadi kesalahan saat mengambil data dari Firestore");
});
});

app.listen(port, () => {
console.log("example listening on port ", port);
});
