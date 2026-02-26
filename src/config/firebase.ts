import admin from "firebase-admin";
import path from "path";

// Service account JSON path
const serviceAccount = require(path.join(
  __dirname,
  "../../serviceAccountKey.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
