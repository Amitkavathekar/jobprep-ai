import mongoose from 'mongoose';

async function connectDb() {
  try {
    const mongoUri = process.env.MONGODB_URI ;
      
    const dbName =  'jobprep-ai';
    await mongoose.connect(mongoUri, { dbName });
    console.log('Connected to MongoDB database');

    try {
      await mongoose.connection.collection('users').dropIndex('userId_1');
      console.log('Dropped legacy userId_1 index from users collection');
    } catch (indexErr) {
      
    }
  } catch (err) {
    console.error(
      'MongoDB connection error:',
      err instanceof Error ? err.message : err
    );
    throw err;
  }
}

export { connectDb };
export default connectDb;
