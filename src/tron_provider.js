import BaseProvider from "./base_provider";
import Utils from "./utils";

export class FoxTronProvider extends BaseProvider  {
  constructor() {
    super();
    this.isFoxWallet = true;
    this.chain = "TRON";
    this.callbacks = new Map();
  }

  emitConnect() {
    window.postMessage({
      message: {
        action: "connect"
      },
      isTronLink: true
    });
  }

  emitDisconnect() {
    window.postMessage({
      message: {
        action: "disconnect"
      },
      isTronLink: true
    });
  }

  emitAccountsChanged(addresses) {
    if (!addresses) return;
    const targetAddress = addresses[0] || false;
    window.postMessage({
      message: {
        action: "accountsChanged",
        data: {
          address: targetAddress
        }
      },
      isTronLink: true
    });
  }

  request(payload) {
    switch (payload.method) {
      case "tron_requestAccounts": {
        if (!window.foxwallet.tronLink.tronWeb) {
          throw new Error("Couldn't find property 'tronWeb' in window.foxwallet.tronLink, please reopen current page again.");
        }
        return this._request(payload.method, payload)
          .then(res => {
            if (res.code === 200) {
              this.emitConnect();
            } else if (res.code === 4001) {
              this.emitDisconnect();
            }
            return res;
          });
      }
      default: 
        return this._request(payload.method, payload);
    }
  }

  _request(method, params) {
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
