import type { NextApiRequest, NextApiResponse } from "next";
import { Keypair } from "@code-wallet/keys";
import bs58 from "bs58";

const TEST_MODE = process.env.TEST_MODE === "true";
const loginDomain = TEST_MODE
  ? "example-getcode.com"
  : process.env.NEXT_PUBLIC_STORE_HOSTNAME || "kin.games";

let verifier: Keypair;
// In test mode, use a fixed secret key. In production, decode the secret key provided.
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json({
      domain: loginDomain,
      verifier: verifier.getPublicKey().toBase58(),
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 