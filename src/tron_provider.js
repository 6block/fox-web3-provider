import BaseProvider from "./base_provider";
import Utils from "./utils";

export class FoxTronProvider extends BaseProvider  {
  constructor() {
    super();
    this.isFoxWallet = true;
    this.chain = "TRON";
    this.callbacks = new Map();
    this.isConnected = false;
    this.address = false;
  }

  postConnectMessage() {
    window.postMessage({
      message: {
        action: "connect"
      },
      isTronLink: true
    });
  }

  postDisconnectMessage() {
    window.postMessage({
      message: {
        action: "disconnect"
      },
      isTronLink: true
    });
    this.address = false;
    this.isConnected = false;
  }

  postAccountsChangedMessage(addresses) {
    if (!addresses) return;

    const targetAddress = addresses[0] || false;
    this.address = targetAddress;
    this.isConnected = true;

    const accountsChanged = this.address !== targetAddress;
    if (accountsChanged) {
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
  }

  request(payload) {
    switch (payload.method) {
      case "tron_requestAccounts": {
        return this._request(payload.method, payload)
          .then(res => {
            this.isConnected = res.code === 200;
            if (res.code === 200) {
              this.postConnectMessage();
            } else if (res.code === 4001) {
              this.postDisconnectMessage();
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
