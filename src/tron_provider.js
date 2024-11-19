import BaseProvider from "./base_provider";
import Utils from "./utils";

export class FoxTronProvider extends BaseProvider  {
  constructor() {
    super();
    this.isFoxWallet = true;
    this.chain = "TRON";
    this.callbacks = new Map();
    this.address = null;
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

  updateAddress(address) {
    if (!address) return;
    window.foxwallet.tronLink.tronWeb?.setAddress(address);

    if (this.address && this.address !== address) {
      this.emitAccountsChanged([address]);
    }
    this.address = address;
  }

  emitAccountsChanged(address) {
    window.postMessage({
      message: {
        action: "accountsChanged",
        data: { address }
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
              this.address = null;
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
