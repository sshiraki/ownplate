import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as Account from "../functions/account";
import { enforceAppCheck, secretKeys } from "./firebase";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    memory: "1GB" as const,
    maxInstances: 5,
    enforceAppCheck,
    secrets: secretKeys,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await Account.deleteAccount(db, context);
  });
