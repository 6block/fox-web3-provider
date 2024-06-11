import BaseProvider from "./base_provider";
import { ErrorMap } from "./constants";
import ProviderRpcError from "./error";
import Utils from "./utils";

export const NETWORK_TYPES = {
  livenet: "livenet",
  testnet: "testnet",
};

export class BTCProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.isFoxWallet = true;
    this.chain = "BTC";
    this.callbacks = new Map();
    this.setConfig(config);
  }

  setConfig(config) {
    const btcConfig = config[this.chain];
    const address = btcConfig.address;
    const publicKey = btcConfig.publicKey;
    const network = btcConfig.network;
    if (address && publicKey) {
      this.address = address;
      this.publicKey = publicKey;
      this.isConnected = true;
    } else {
      this.address = null;
      this.publicKey = null;

      this.isConnected = false;
    }
    this.network = network;
    this.config = btcConfig;
  }

  assertConnected() {
    if (!this.isConnected) {
      throw new ProviderRpcError(ErrorMap.Unauthorized);
    }
  }

  async connect() {
    if (this.address && this.publicKey) {
      Utils.emitConnectEvent(this.chain, this.config, {
        address: this.address,
      });
      return {
        address: this.address,
        publicKey: this.publicKey,
      };
    }
    let { address, publicKey } = await this.send("requestAccounts");
    if (address && publicKey) {
      this.address = address;
      this.publicKey = publicKey;
      this.isConnected = true;
    }
    return {
      address: address,
      publicKey: publicKey,
    };
  }

  async requestAccounts() {
    if (this.address) {
      Utils.emitConnectEvent(this.chain, this.config, {
        address: this.address,
      });
      return [this.address];
    }
    let { address, publicKey } = await this.send("requestAccounts");
    if (address && publicKey) {
      this.address = address;
      this.publicKey = publicKey;
      this.isConnected = true;
      Utils.emitConnectEvent(this.chain, this.config, {
        address: this.address,
      });
    }
    return [address];
  }

  async getAccounts() {
    return this.address ? [this.address] : [];
  }

  async getPublicKey() {
    return this.publicKey || "";
  }

  async getNetwork() {
    if (this.network) {
      return this.network;
    }
    return this.send("getNetwork");
  }

  async switchNetwork(network) {
    return this.send("switchNetwork", network);
  }

  async signMessage(message, option) {
    this.assertConnected();
    return this.send("signMessage", { message, option });
  }

  async getBalance() {
    this.assertConnected();
    return this.send("getBalance");
  }

  async getInscriptions(cursor, size) {
    this.assertConnected();
    return this.send("getInscriptions", { cursor, size });
  }

  async sendBitcoin(toAddress, satoshis, option) {
    this.assertConnected();
    return this.send("sendBitcoin", {
      toAddress,
      satoshis,
      option,
    });
  }

  async sendInscription(toAddress, inscriptionId, options) {
    this.assertConnected();
    return this.send("sendInscription", { toAddress, inscriptionId, options });
  }

  async pushTx(rawtx) {
    this.assertConnected();
    return this.send("pushTx", { rawtx });
  }

  async signPsbt(psbtHex, options) {
    this.assertConnected();
    return this.send("signPsbt", { psbtHex, options });
  }

  async signPsbts(psbtHexs, options) {
    this.assertConnected();
    return this.send("signPsbts", { psbtHexs, options });
  }

  async pushPsbt(psbtHex) {
    this.assertConnected();
    return this.send("pushPsbt", psbtHex);
  }

  // method: 'inscribeTransfer',
  async inscribeTransfer(ticker, amount) {
    this.assertConnected();
    return this.send("inscribeTransfer", { ticker, amount });
  }

  networkChanged(network) {
    this.emit("networkChanged", network);
  }

  accountsChanged(addresses) {
    this.emit("accountsChanged", addresses);
  }

  accountChanged(addressInfo) {
    this.emit("accountChanged", addressInfo);
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
