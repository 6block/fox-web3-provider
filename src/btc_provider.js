import BaseProvider from "./base_provider";
import Utils from "./utils";

export const NETWORK_TYPES = {
  livenet :"livenet",
  testnet :"testnet",
};

export class BTCProvider extends BaseProvider  {
  constructor() {
    super();
    this.isFoxWallet = true;
    this.chain = "BTC";
    this.callbacks = new Map();
    this.isConnected = false;
  }

  async assertConnected() {
    await this.getAccounts();
    if (!this.isConnected) {
      await this.send("requestAccounts");
    }
  }

  async requestAccounts() {
    let accounts = await this.send("requestAccounts");
    if (accounts&&accounts.length>0) {
      this.isConnected = true;
    }
    return accounts;
  }

  async getAccounts() {
    let accounts = await this.send("getAccounts");
    if (accounts&&accounts.length>0) {
      this.isConnected = true;
    }
    return accounts;
  }

  async getPublicKey() {
    await this.assertConnected();
    return this.send("getPublicKey");
  }

  async getNetwork() {
    return this.send("getNetwork");
  }

  async switchNetwork(network) {
    return this.send("switchNetwork", network);
  }

  async signMessage(message, option) {
    return this.send("signMessage", { message, option });
  }
  async getBalance() {
    await this.assertConnected();
    return this.send("getBalance");
  }
  async getInscriptions(cursor, size) {
    await this.assertConnected();
    return this.send("getInscriptions", { cursor, size });
  }
  async sendBitcoin(toAddress,satoshis, option) {
    return this.send("sendBitcoin",
      {
        toAddress,
        satoshis,
        option
      });
  }
  async sendInscription(toAddress, inscriptionId, options) {
    return this.send("sendInscription", { toAddress, inscriptionId, options});
  }
  async pushTx(rawtx) {
    return this.send("pushTx", { rawtx });
  }
  async signPsbt(psbtHex, options) {
    return this.send("signPsbt", { psbtHex, options });
  }
  async signPsbts(psbtHexs, options) {
    return this.send("signPsbts", { psbtHexs, options });
  }
  async pushPsbt(psbtHex) {
    return this.send("pushPsbt", psbtHex);
  }
  // method: 'inscribeTransfer',
  async inscribeTransfer(ticker, amount) {
    console.log("==> inscribeTransfer");
    return this.send("inscribeTransfer", { ticker, amount });
  }

  networkChanged(network) {
    this.emit("networkChanged", network);
  }

  accountsChanged(addresses) {
    this.emit("accountsChanged", addresses);
  }

  send(method, params) {
    // id: number;
    // name: string; // 方法名
    // object: any; // payload
    // chain: CoinType;
    const id = Utils.genId();
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
      this.postMessage(method, id, params);
    });

  }
}
