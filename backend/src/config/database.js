import mongoose from 'mongoose';  // Fixed: "mongoose"

const connectDB = async () => {
    try {
        // Use the correct environment variable name
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intern_assignment';
        
        console.log('🔗 Connecting to MongoDB...');
        console.log('📡 URI:', MONGODB_URI);
        
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// Add event listeners for better debugging
mongoose.connection.on('connected', () => {
    console.log('🎯 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
});

export default connectDB;