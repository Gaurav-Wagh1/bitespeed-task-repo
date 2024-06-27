const express = require("express");

const { PORT } = require("./config/server-config");
const router = require("./routes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

// const { Contact } = require("./models/index");

// Contact.create({
//     email: "two@gmail.com",
//     phoneNumber: "11111",
//     linkedId: 1,
//     linkPrecedence: "secondary"
// });

const {ContactService} = require("./services/contact-service");
const contact = new ContactService();

// contact.processContactRequest("four@gmail.com", "4444");

// contact.processContactRequest("five@gmail.com", "5555");

app.listen(PORT, () => {
    console.log("Server listening on port - ", PORT);
});