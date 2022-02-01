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

// JS- reorganized the code below into a single async function, which is called after the function is defined
// this allows for the use of await on all async functions called within this function
async function doStxTransfer() {
  const apiConfig = new Configuration({
    fetchApi: fetch,
    // for mainnet, replace `testnet` with `mainnet`
    basePath: "https://stacks-node-api.testnet.stacks.co",
  });

  const key = ""; // NEED: PRIVATE KEY FROM STACKS-GEN
  const senderKey = createStacksPrivateKey(key);
  console.log(`senderKey: ${privateKeyToString(senderKey)}`);
  // JS- moved this up with other sender info
  const senderAddress = ""; // NEED: STX ADDRSES FROM STACKS-GEN

  const recipient = "ST1T4P94X6YSSXBWBQ8HBVAGZSGNF1GFRRXCN45DB";

  // amount of Stacks (STX) tokens to send (in micro-STX). 1,000,000 micro-STX are worth 1 Stacks (STX) token
  const amount = new BN(1000000);

  // skip automatic fee estimation
  const fee = new BN(2000);

  // JS- commented out since we need to look up the nonce anyway
  //const nonce = new BN(0);

  // override default setting to broadcast to the Testnet network
  // for mainnet, use `StacksMainnet()`
  const network = new StacksTestnet();

  // JS- had to add network to the call in function or it will use mainnet by default
  // verified it works with a valid sender address
  const senderNonce = await getNonce(senderAddress, network);
  console.log(`senderNonce: ${senderNonce}`);
  const nonce = new BN(senderNonce);

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

  const transaction = await makeSTXTokenTransfer(txOptions);
  console.log(`transaction: ${transaction}`);
  const serializedTx = transaction.serialize().toString("hex");
  console.log(`serializedTx: ${serializedTx}`);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  console.log(`broadcastResponse: ${JSON.stringify(broadcastResponse)}`);
  const txID = broadcastResponse.txid;
  console.log(`txID: ${txID}`);

  // JS- not sure why this bit isn't working, but tx is submitted
  // and viewable in the explorer at this point
  //const transactions = new TransactionsApi(apiConfig);
  //const txInfo = await transactions.getTransactionById({
  //  txId: txID,
  //});
  //console.log(`txInfo: ${txInfo}`);
}

doStxTransfer();

// example tx: https://explorer.stacks.co/txid/0x0b5925c1c3a2d1ad41f4615c4638a23c591b87ffc43f23adab45079de82104a8
