import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDb } from './config/database';

const PORT = process.env.PORT || 5001;

async function start() {

    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

}
start().catch((err) => {
  console.error(
    'Failed to start server:',
    err instanceof Error ? err.message : err
  );
  process.exitCode = 1;
});
