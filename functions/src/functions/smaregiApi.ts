import express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import SmaregiApi from "../smaregi/smaregiapi";
// import { ownPlateConfig } from '../common/project';
// import * as Sentry from '@sentry/node';
import { smaregi } from "../common/project";
import { response200 } from "./apis";
import moment from "moment";

const clientSecrets = (functions.config() &&
  functions.config().smaregi &&
  functions.config().smaregi.clientsecrets) || {
  [smaregi.clientId]: process.env.SmaregiClientSecret,
};

export const smaregiRouter = express.Router();

if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();

export const updateDb = (_db) => {
  db = _db;
};

const subscribe = async (req: any, res: any) => {
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(req.body));

  await db
    .collection("smaregiLog/log/subscribe")
    .add({ data: req.body, createdAt: admin.firestore.Timestamp.now() });
  return response200(res, {});
};

export const processAction = async (data) => {
  const contractId = data.contractId;
  const clientSecret = clientSecrets[smaregi.clientId];
  if (data.action === "edited" && data.event === "pos:stock") {
    const config = {
      contractId: contractId,
      clientId: smaregi.clientId,
      clientSecret: clientSecret,
      hostName: smaregi.apiHost,
      scopes: [
        "pos.stock:read",
        "pos.stock:write",
        "pos.stores:read",
        "pos.stores:write",
        "pos.customers:read",
        "pos.customers:write",
        "pos.products:read",
        "pos.products:write",
      ],
    };

    data.ids.map(async (idData) => {
      const { storeId, productId } = idData;
      const api = new SmaregiApi(config);
      await api.auth();
      const stockApi = api.stock();
      const stockListData = await stockApi.list({
        store_id: storeId,
        product_id: productId,
      });
      if (stockListData && stockListData[0]) {
        const amount = stockListData[0].stockAmount;
        await db
          .doc(`smaregiData/${storeId}/smaregiProducts/${productId}`)
          .set({
            store_id: storeId,
            product_id: productId,
            amount,
          });
      }
    });
  }
};

const webhook = async (req: any, res: any) => {
  const data = req.body;

  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(data));

  const contractId = req.body.contractId;
  const time = moment().format("YYYYMMDDHHmmss.SSS");
  // await db.collection("smaregiLog/log/webhook").add({data: req.body, createdAt: admin.firestore.Timestamp.now()});

  // tslint:disable-next-line
  processAction(data);

  await db.doc(`smaregiLog/${contractId}/webhookLog/${time}`).set({
    data,
    contractId,
    createdAt: admin.firestore.Timestamp.now(),
  });

  return response200(res, {});
};

smaregiRouter.post("/subscribe", subscribe);
smaregiRouter.post("/webhook", webhook);
