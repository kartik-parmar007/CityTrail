const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedSuperAdmin = async () => {
  try {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const existingAdmin = await User.findOne({ email: adminEmail });
  
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
  
        await User.create({
          role: 'superadmin',
          email: adminEmail,
          password: hashedPassword,
          name: 'Super Admin',
        });
        console.log('Super Admin seeded successfully!');
      } else {
        console.log('Super Admin already exists.');
      }
    }

    const supportAdminEmail = process.env.SUPPORT_ADMIN_EMAIL;
    const supportPassword = process.env.SUPPORT_ADMIN_PASSWORD;
    const supportName = process.env.SUPPORT_ADMIN_NAME || 'CityTrail Support Admin';
    const supportPhone = process.env.SUPPORT_ADMIN_PHONE || '';
    
    if (supportAdminEmail && supportPassword) {
      const existingSupportAdmin = await User.findOne({ email: supportAdminEmail });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(supportPassword, salt);
      if (!existingSupportAdmin) {
        await User.create({
          role: 'superadmin',
          email: supportAdminEmail,
          password: hashedPassword,
          name: supportName,
          phone: supportPhone
        });
        console.log('Support Admin seeded successfully!');
      } else {
        existingSupportAdmin.password = hashedPassword;
        existingSupportAdmin.name = supportName;
        existingSupportAdmin.phone = supportPhone;
        await existingSupportAdmin.save();
        console.log('Support Admin updated successfully!');
      }
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  }
};

module.exports = seedSuperAdmin;
