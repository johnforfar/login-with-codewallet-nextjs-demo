import type { NextApiRequest, NextApiResponse } from "next";
import code from "@code-wallet/client";
import { Keypair } from "@code-wallet/keys";
import bs58 from "bs58";

const TEST_MODE = process.env.TEST_MODE === "true";

let verifier: Keypair;
if (TEST_MODE) {
  verifier = Keypair.fromSecretKey(
    new Uint8Array([
      83, 255, 243, 143, 25, 147, 129, 161, 100, 93, 242, 14, 163, 113, 169, 47,
      214, 219, 32, 165, 210, 0, 137, 115, 42, 212, 37, 205, 193, 3, 249, 158,
    ])
  );
} else if (process.env.STORE_VERIFIER_SECRET) {
  verifier = Keypair.fromSecretKey(bs58.decode(process.env.STORE_VERIFIER_SECRET));
} else {
  verifier = Keypair.generate();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const payload = req.body;
      console.log("Received payload:", payload);
      let webhook = payload.webhook ? { ...payload.webhook } : null;
      if (payload.webhook) {
        payload.webhook = null;
      }
      const response = await code.paymentIntents.create(payload);
      console.log("Payment intent created:", response);
      if (webhook) {
        const { success, message } = await code.webhook.register({
          intent: response.id,
          url: webhook.url,
        });
        console.log("Webhook register:", message);
      }
      res.status(200).json(response);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 