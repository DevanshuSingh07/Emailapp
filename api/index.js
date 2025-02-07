require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");


const app = express();
const PORT = process.env.PORT || 5000;
const url =process.env.scriptUrl 

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail", // Change if using another service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.get("/", (req, res) => {
    res.send("API is working!");
});


// API route to handle email sending
app.post("/send-email", async (req, res) => {

    const paymentAmount = req.body.payload.payment.entity.amount;
    const paymentCurrency = req.body.payload.payment.entity.currency;
    const paymentEmail = req.body.payload.payment.entity.email;
    

    const amount = Number((paymentAmount / 100).toFixed(2));
    console.log(paymentEmail)
    console.log(amount)


    if (!paymentEmail || !paymentAmount || !paymentCurrency) {
        console.log("if block")
        return res.status(400).json({ error: "All fields are required." });

    }
    const userinfo = await getuserinfo(paymentEmail)

    // const trimstr= userinfo['Complete the checkout below']

    // const trimmedStr = trimstr.replace(/^₹\d+\s-\s/, "");


    console.log("userinfo",userinfo)

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: paymentEmail,
        subject: "Payment Confirmation - CertifyMyHealth",
        text: userinfo ? `Dear ${userinfo["Name of the Patient"]},

We are pleased to confirm the successful receipt of your payment of ${paymentCurrency} ${amount}/- for ${userinfo["I am seeking"]}. Your payment was processed on ${userinfo["Added Time"]}, and your document ID is ${userinfo["Unique ID"]}.

Our team is currently reviewing your request and will be in touch shortly to discuss your case requirements and the next steps. If you have any urgent queries in the meantime, please do not hesitate to contact us at 7061905266.

We sincerely appreciate your trust in CertifyMyHealth and look forward to assisting you.

Best regards,
Team CertifyMyHealth


`:
`Greeting from CertifyMyHealth,\n payment received ${paymentCurrency} ${amount}.
Our team is currently reviewing your request and will be in touch shortly to discuss your case requirements and the next steps. If you have any urgent queries in the meantime, please do not hesitate to contact us at 7061905266.
We sincerely appreciate your trust in CertifyMyHealth and look forward to assisting you.

Best regards,
Team CertifyMyHealth`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: "Email sent successfully." });
        console.log("email sent")
    } catch (error) {
        console.log("error")
        res.status(500).json({ error: "Failed to send email.", details: error.message });
    }
});

async function getuserinfo(mail) {
    try {
        const response = await axios.get(url, {
            params: { email: mail }
        });
        if (response.data.error != "Email not found") {
            const data = response.data
            console.log("Response Data:", response.data);
            return data

        }
        else {
            return undefined
        }
        
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}


app.listen(PORT, () => console.log(`Server running on port ${PORT} `));
