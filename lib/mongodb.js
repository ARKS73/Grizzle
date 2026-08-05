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
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      maxPoolSize: 25,
      minPoolSize: 5,
      family: 4,
    };

    // Fast Direct Cluster URI first to avoid 5-10s Windows/Serverless SRV DNS timeouts
    cached.promise = mongoose.connect(DIRECT_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((directErr) => {
        console.warn('Direct URI failed, trying SRV URI fallback:', directErr.message);
        return mongoose.connect(SRV_URI, opts)
          .then((mongooseInstance) => {
            return mongooseInstance;
          })
          .catch((srvErr) => {
            console.error('MongoDB Connection Error:', srvErr.message);
            cached.promise = null;
            throw srvErr;
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
