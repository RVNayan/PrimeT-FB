import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Check:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('   PORT:', process.env.PORT);

// Validate required environment variables
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is required in environment variables');
    process.exit(1);
}

import app from './app.js';
import connectDB from './config/database.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        console.log('🚀 Starting server...');
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`🎉 Server running on port ${PORT}`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();