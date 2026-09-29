import mongoose from "mongoose";
async function connectDb() {
  try {
    await mongoose.connect(
      'mongodb://amit:NHOctORoHnITUbIw@ac-gzog6ib-shard-00-00.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-01.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-02.uujmrd6.mongodb.net:27017/?ssl=true&replicaSet=atlas-lvwapq-shard-0&authSource=admin'
    );
    console.log('Connected to MongoDB database');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectDb;
