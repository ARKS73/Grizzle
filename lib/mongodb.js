import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const SRV_URI = process.env.MONGODB_URI || 'mongodb+srv://grizzle_admin:Grizzle_siro@grizzle0.e2alnpc.mongodb.net/grizzle?retryWrites=true&w=majority';
const DIRECT_URI = 'mongodb://grizzle_admin:Grizzle_siro@grizzle0-shard-00-00.e2alnpc.mongodb.net:27017,grizzle0-shard-00-01.e2alnpc.mongodb.net:27017,grizzle0-shard-00-02.e2alnpc.mongodb.net:27017/grizzle?ssl=true&replicaSet=atlas-grizzle0-shard-0&authSource=admin&retryWrites=true&w=majority';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
    };

    cached.promise = mongoose.connect(SRV_URI, opts)
      .then((mongooseInstance) => {
        console.log('MongoDB Atlas connected successfully (SRV)');
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn('SRV Connection Failed, retrying with Direct Seedlist URI:', err.message);
        return mongoose.connect(DIRECT_URI, opts)
          .then((mongooseInstance) => {
            console.log('MongoDB Atlas connected successfully (Direct Cluster)');
            return mongooseInstance;
          })
          .catch((directErr) => {
            console.error('MongoDB Atlas Connection Failed: Ensure 0.0.0.0/0 IP is whitelisted in MongoDB Atlas Network Access rules.', directErr.message);
            cached.promise = null;
            throw directErr;
          });
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

