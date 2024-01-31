import BaseProvider from "./base_provider";
import Utils from "./utils";

export class CustomProvider extends BaseProvider  {
  constructor() {
    super();
    this.isFoxWallet = true;
    this.chain = "custom";
    this.callbacks = new Map();
  }

  async syncWallet(event) {
    return await this.send("syncWallet", event);
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
