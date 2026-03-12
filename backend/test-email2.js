const nodemailer = require('nodemailer');
const fs = require('fs');

const testSMTP = async () => {
    let log = [];
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
        
        log.push("Sending email...");
        const info = await transporter.sendMail({
          from: '"CityTrail" <meetrathod0104@gmail.com>',
          to: 'meetrathod0104@gmail.com',
          subject: 'Test Email',
          text: 'This is a test email.',
          html: '<p>This is a test email.</p>',
        });
        log.push("Message sent: " + info.messageId);
        
        fs.writeFileSync('smtp_log.txt', log.join('\n'));
        process.exit(0);
    } catch(err) {
        log.push("Failed: " + err.message);
        fs.writeFileSync('smtp_log.txt', log.join('\n'));
        process.exit(1);
    }
}

testSMTP();
