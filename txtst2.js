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
console.log('sender key: ' + JSON.stringify(senderKey));

const recipient = 'ST1T4P94X6YSSXBWBQ8HBVAGZSGNF1GFRRXCN45DB';

// amount of Stacks (STX) tokens to send (in micro-STX). 1,000,000 micro-STX are worth 1 Stacks (STX) token
const amount = new BN(1000000);

// skip automatic fee estimation
const fee = new BN(2000);

// skip automatic nonce lookup
const nonce = new BN(0);

// override default setting to broadcast to the Testnet network
// for mainnet, use `StacksMainnet()`
const network = new StacksTestnet();

const memo = 'hello world';

const txOptions = {
  recipient,
  amount,
  fee,
  nonce,
  senderKey: privateKeyToString(senderKey),
  network,
  memo,
};

// --- changed from original Hiro example code: wrapped in async function to satisfy Node requirement
async function doTransfer(){
    const transaction = await makeSTXTokenTransfer(txOptions);
    return transaction;
}
const transaction = doTransfer();

const senderAddress = "SJ2FYQ8Z7JY9BWYZ5WM53SKR6CK7WHJF0691NZ942";

// --- This failed, said unable to get Nonce.  Is the wallet address from this example code still valid?
// const senderNonce = getNonce(senderAddress);

const serializedTx = transaction.serialize().toString("hex");

// --- changed from original Hiro example code: wrapped in async function to satisfy Node requirement
async function doBroadcast(){
    const broadcastResponse = await broadcastTransaction(transaction, network);
    return broadcastResponse;
}
var broadcastResponse = doBroadcast();

// --- added this line to view the response
console.log('\nbroadcasat response:\n' + broadcastResponse);

const txID = broadcastResponse.txid;

const transactions = new TransactionsApi(apiConfig);

// --- changed from original Hiro example code: wrapped in async function to satisfy Node requirement
async function doTransaction(){
    var txId = '';
    const txInfo = await transactions.getTransactionById({
        txId,
      });
    return txInfo;
}

// --- added this line to see the transaction response
doTransaction().then(function(result){
    console.log(result);
});