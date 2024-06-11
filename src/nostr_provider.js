import BaseProvider from "./base_provider";
import Utils from "./utils";

export class NOSTRProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.isFoxWallet = true;
    this.chain = "NOSTR";
    this.callbacks = new Map();
    this.setConfig(config);
  }

  setConfig(config) {
    const nostrConfig = config[this.chain];
    this.publicKey = nostrConfig.publicKey;
    this.isConnected = !!this.publicKey;
    this.config = nostrConfig;
  }

  nip04 = {
    encrypt: async (pubkey, plaintext) => {
      return await this.send("encrypt", { pubkey, plaintext });
    },
    decrypt: async (pubkey, ciphertext) => {
      return await this.send("decrypt", { pubkey, ciphertext });
    },
  };

  async getPublicKey() {
    if (this.publicKey) {
      Utils.emitConnectEvent(this.chain, this.config, {
        address: this.publicKey,
      });
      return this.publicKey;
    }
    let account = await this.send("getPublicKey");
    if (account) {
      this.publicKey = account;
      this.isConnected = true;
      Utils.emitConnectEvent(this.chain, this.config, {
        address: account,
      });
    }
    return account;
  }

  async signEvent(event) {
    return await this.send("signEvent", event);
  }

  async getRelays() {
    return await this.send("getRelays");
  }

  async encrypt(pubkey, plaintext) {
    return await this.send("encrypt", { pubkey, plaintext });
  }

  async decrypt(pubkey, ciphertext) {
    return await this.send("decrypt", { pubkey, ciphertext });
  }

  async signSchnorr(sigHash) {
    return await this.send("signSchnorr", { sigHash });
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
