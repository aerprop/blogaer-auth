import { CorsOptions } from 'cors';
import { config } from 'dotenv';

config();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins?.indexOf(origin || '') !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};

export default corsOptions;
