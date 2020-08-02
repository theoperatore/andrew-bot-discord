import * as admin from 'firebase-admin';

const creds = process.env.GCLOUD_CREDENTIALS;
const dbUrl = process.env.FIREBASE_DATABASE_URL;

if (!creds) {
  throw new Error('no GCLOUD_CREDENTIALS found in environment');
}

const serviceAccount = JSON.parse(
  Buffer.from(creds, 'base64').toString('utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: dbUrl,
});

const firestore = admin.firestore();

export type DbGame = {
  id: string;
  name: string;
  platform_id: number;
  platform_name: string;
  first_sent_ts: number;
};

export type LastPlatform = {
  id: string;
};

export function getGame(id: string) {
  return firestore
    .collection('gotd-games')
    .doc(`${id}`)
    .get()
    .then(data => data.data())
    .then(d => (d ? (d as DbGame) : undefined));
}

export function saveGame(
  id: string,
  name: string,
  platform_id: number,
  platform_name: string
) {
  return firestore.collection('gotd-games').doc(`${id}`).create({
    id,
    name,
    platform_id,
    platform_name,
    first_sent_ts: Date.now(),
  });
}

export function getLastPlatform() {
  return firestore
    .collection('last-platform')
    .doc('last-platform')
    .get()
    .then(data => data.data())
    .then(d => (d ? (d as LastPlatform) : undefined));
}

/**
 *
 * @param id The string Id of the last platform
 */
export function saveLastPlatform(id: string) {
  return firestore.collection('last-platform').doc('last-platform').set({ id });
}
