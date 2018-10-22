const nodemailer = require('nodemailer');

// Connect to nodemailer using our SMTP settings
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Using a string template for now, we could also do fancy pug templating or use a framework for
// generating much fancier emails but this is good enough for now!
const makeANiceEmail = text => `
  <div className="email" style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
  ">
    <h2>Hello There!</h2>
    <p>${text}</p>
    <p>😘, Sick Fits Team</p>
  </div>
`;

module.exports = {
  transport,
  makeANiceEmail,
};
