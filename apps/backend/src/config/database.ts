import mongoose from 'mongoose';

async function connectDb() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://amit:NHOctORoHnITUbIw@ac-gzog6ib-shard-00-00.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-01.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-02.uujmrd6.mongodb.net:27017/?ssl=true&replicaSet=atlas-lvwapq-shard-0&authSource=admin';
    const databaseName = mongoUri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/)?.[1];
    const dbName = databaseName || 'jobprep-ai';
    await mongoose.connect(mongoUri, { dbName });
    console.log('Connected to MongoDB database');

    try {
      await mongoose.connection.collection('users').dropIndex('userId_1');
      console.log('Dropped legacy userId_1 index from users collection');
    } catch (indexErr) {
      // Index might already be dropped or not exist
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
