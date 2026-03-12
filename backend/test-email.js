const nodemailer = require('nodemailer');

const testSMTP = async () => {
    try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'meetrathod0104@gmail.com', 
            pass: 'wbst gsoc rsmj ogyj', 
          },
        });
        
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("Connection verified successfully!");
        
        const info = await transporter.sendMail({
          from: '"Test" <meetrathod0104@gmail.com>',
          to: 'meetrathod0104@gmail.com',
          subject: 'Test Email',
          text: 'This is a test email.',
          html: '<p>This is a test email.</p>',
        });
        
        console.log('Message sent: %s', info.messageId);
    } catch(err) {
        console.error("Failed:", err.message);
    }
}

testSMTP();
