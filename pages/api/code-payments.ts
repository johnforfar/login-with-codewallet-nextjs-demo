import type { NextApiRequest, NextApiResponse } from "next";
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    public_keys: [verifier.getPublicKey().toBase58()],
  });
} 