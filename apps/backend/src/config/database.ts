import mongoose from 'mongoose';

async function connectDb() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://amit:NHOctORoHnITUbIw@ac-gzog6ib-shard-00-00.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-01.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-02.uujmrd6.mongodb.net:27017/?ssl=true&replicaSet=atlas-lvwapq-shard-0&authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB database');
  } catch (err) {
    console.error(
      'MongoDB connection error:',
      err instanceof Error ? err.message : err
    );
  }
}

export { connectDb };
export default connectDb;
