import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDb } from './config/database.js';

const PORT = process.env.PORT || 5000;

async function start() {

    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

}
start();
