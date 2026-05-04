import "server-only";

import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "medaille";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (globalThis.__mongoClientPromise) {
    return globalThis.__mongoClientPromise;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "La variable d'environnement MONGODB_URI est requise. " +
        "Créez un fichier .env.local et définissez MONGODB_URI=mongodb://...",
    );
  }
  const client = new MongoClient(uri, { maxPoolSize: 10 });
  const promise = client.connect();
  if (process.env.NODE_ENV !== "production") {
    globalThis.__mongoClientPromise = promise;
  }
  return promise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
