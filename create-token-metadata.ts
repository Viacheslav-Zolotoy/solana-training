import "dotenv/config";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { getExplorerLink } from "@solana-developers/helpers";
// Yes, createCreate! We're making an instruction for createMetadataV3...
import {
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

let privateKey = process.env["SECRET_KEY"];
if (privateKey === undefined) {
  console.log("Add SECRET_KEY to .env!");
  process.exit(1);
}
const asArray = Uint8Array.from(JSON.parse(privateKey));
const sender = Keypair.fromSecretKey(asArray);

const connection = new Connection(clusterApiUrl("devnet"));

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const tokenMintAccount = new PublicKey(
  "6FtPKgVijL78LpkVuDUnMNQGhQxJquNSjgUgckRfq7Yw"
);

const metadataData = {
  name: "Solana UA Bootcamp 2024-08-06",
  symbol: "UAB-2",
  // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
  uri: "https://arweave.net/1234",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};
const [metadataPDA, _metadataBump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);
const transaction = new Transaction();
//--// Creata metadata
const createMetadataAccountInstruction =
  createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: sender.publicKey,
      payer: sender.publicKey,
      updateAuthority: sender.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    }
  );
transaction.add(createMetadataAccountInstruction);

//--//Update metadata
// const updateMetadataAccountInstruction =
//   createUpdateMetadataAccountV2Instruction(
//     {
//       metadata: metadataPDA,
//       updateAuthority: sender.publicKey,
//     },
//     {
//       updateMetadataAccountArgsV2: {
//         data: metadataData,
//         updateAuthority: sender.publicKey,
//         primarySaleHappened: null,
//         isMutable: true,
//       },
//     }
//   );

// transaction.add(updateMetadataAccountInstruction);

await sendAndConfirmTransaction(connection, transaction, [sender]);

const tokenMintLink = getExplorerLink(
  "address",
  tokenMintAccount.toString(),
  "devnet"
);
console.log(`✅ Look at the token mint again: ${tokenMintLink}!`);
