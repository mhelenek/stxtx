const { fetch } = require("cross-fetch");
const BN = require("bn.js");
const {
  makeSTXTokenTransfer,
  createStacksPrivateKey,
  broadcastTransaction,
  estimateTransfer,
  getNonce,
  privateKeyToString,
} = require("@stacks/transactions");
const { StacksTestnet, StacksMainnet } = require("@stacks/network");
const {
  TransactionsApi,
  Configuration,
  AccountsApi,
  FaucetsApi,
} = require("@stacks/blockchain-api-client");

const apiConfig = new Configuration({
  fetchApi: fetch,
  // for mainnet, replace `testnet` with `mainnet`
  basePath: "https://stacks-node-api.testnet.stacks.co",
});

const key =
  "edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc01";
const senderKey = createStacksPrivateKey(key);
console.log("sender key: " + JSON.stringify(senderKey));

const recipient = "ST1T4P94X6YSSXBWBQ8HBVAGZSGNF1GFRRXCN45DB";

// amount of Stacks (STX) tokens to send (in micro-STX). 1,000,000 micro-STX are worth 1 Stacks (STX) token
const amount = new BN(1000000);

// skip automatic fee estimation
const fee = new BN(2000);

// skip automatic nonce lookup
const nonce = new BN(0);

// override default setting to broadcast to the Testnet network
// for mainnet, use `StacksMainnet()`
const network = new StacksTestnet();

const memo = "hello world";

const txOptions = {
  recipient,
  amount,
  fee,
  nonce,
  senderKey: privateKeyToString(senderKey),
  network,
  memo,
};

// JS- moved this before the functions since it's just another constant definition
const senderAddress = "SJ2FYQ8Z7JY9BWYZ5WM53SKR6CK7WHJF0691NZ942";

// JS- reorganized the code below into a single async function, which is called after the function is defined
async function doStxTransfer() {
  const transaction = await makeSTXTokenTransfer(txOptions);
  // JS- had to add network to the call before or it will use mainnet by default
  // currently fails because senderAddress is invalid - works with recipient though
  const senderNonce = await getNonce(senderAddress, network);
  console.log(`transaction: ${transaction}`);
  console.log(`senderNonce: ${senderNonce}`);
  const serializedTx = transaction.serialize().toString("hex");
  console.log(`serializedTx: ${serializedTx}`);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  console.log(`broadcastResponse: ${broadcastResponse}`);
  const txID = broadcastResponse.txid;
  console.log(`txID: ${txID}`);
  const transactions = new TransactionsApi(apiConfig);
  const txInfo = await transactions.getTransactionById({
    txID,
  });
  console.log(`txInfo: ${txInfo}`);
}

doStxTransfer();
