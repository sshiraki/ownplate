import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as StripeOAuth from "../../functions/stripe/oauth";
import { allowInvalidAppCheckToken } from "../firebase";

const db = admin.firestore();

export default functions
  .runWith({
    memory: "1GB" as "1GB",
    allowInvalidAppCheckToken,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called from an App Check verified app.')
    }
    return await StripeOAuth.connect(db, data, context);
  });
