#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚗 Garage Management System Setup');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=garage_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Server Configuration
PORT=5000
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
}

// Check if node_modules exists
const clientNodeModules = path.join(__dirname, 'client', 'node_modules');
const serverNodeModules = path.join(__dirname, 'node_modules');

if (!fs.existsSync(serverNodeModules)) {
  console.log('\n📦 Installing server dependencies...');
  console.log('Run: npm install');
} else {
  console.log('✅ Server dependencies already installed');
}

if (!fs.existsSync(clientNodeModules)) {
  console.log('\n📦 Installing client dependencies...');
  console.log('Run: cd client && npm install');
} else {
  console.log('✅ Client dependencies already installed');
}

console.log('\n🎯 Next Steps:');
console.log('1. Update the .env file with your database credentials');
console.log('2. Start your MySQL server');
console.log('3. Install dependencies: npm install && cd client && npm install');
console.log('4. Start the server: npm run dev');
console.log('5. Start the client: npm run client (in another terminal)');
console.log('\n🔑 Default login credentials:');
console.log('   Username: admin');
console.log('   Password: admin123');
console.log('\n📚 For more information, see README.md');

rl.close();
