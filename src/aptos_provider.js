"use strict";

import Utils from "./utils";

class PetraError extends Error {
  constructor(message) {
    if (message === "Unauthorized") {
      super("The requested method and/or account has not been authorized by the user");
      this.name = "Unauthorized";
      this.code = 4100;
    } else if (message === "User Cancel input" || message==="User rejected the request") {
      super("The user rejected the request.");
      this.name = "User rejection";
      this.code = 4001;
    } else {
      super(message);
      this.name = "Internal error";
      this.code = 99999;
    }
  }
}

class FoxWalletAptosProvider {
  constructor() {
    this.isFoxwallet = true;
    this.chain = "APTOS";
    this.connected = false;
    this.connectedAccount = null;
    this.callbacks = new Map();
    this.networkChangeCallbacks = [];
  }

  invokeRNMethod(payload) {
    return new Promise((resolve, reject) => {
      if (window.foxwallet.postMessage) {
        this.callbacks.set(payload.id, (error, data) => {
          try {
            if (error) {
              let errorString = JSON.parse(decodeURIComponent(error));
              reject(errorString);
            } else {
              let resultData = JSON.parse(decodeURIComponent(data));
              resolve(resultData);
            }
          } catch (e) {
            console.log("invokeRNMethod", { e });
            reject(e);
          }
        });
        window.foxwallet.postMessage(payload);
      } else {
        reject(new PetraError("can not communicate with wallet"));
      }
    });
  }

  sendResponse(id, result, error) {
    let callback = this.callbacks.get(id);
    if (callback) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, result);
      }
      this.callbacks.delete(id);
    } else {
      // check if it's iframe callback
      for (let i = 0; i < window.frames.length; i++) {
        const frame = window.frames[i];
        try {
          if (frame.aptos.callbacks.has(id)) {
            frame.aptos.sendResponse(id, result);
          }
        } catch (error) {
          console.log(`send response to frame error: ${error}`);
        }
      }
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      let object = {
        id: callbackId,
        name: "connect",
        chain: this.chain,
      };
      this.invokeRNMethod(object).then(connectedAccount => {
        this.connected = true;
        this.connectedAccount = connectedAccount;
        resolve(connectedAccount);
      }).catch(error => {
        reject(new PetraError(error));
      });
    });
  }

  // no prompt
  account() {
    return new Promise((resolve, reject) => {
      if (this.connectedAccount) {
        resolve(this.connectedAccount);
      } else {
        reject(new PetraError("Unauthorized"));
      }
    });
  }

  disconnect(){
    return new Promise((resolve) => {
      this.connected = false;
      this.connectedAccount = null;
      resolve();
    });
  }

  isConnected() {
    return new Promise((resolve) => {
      resolve(this.connected);
    });
  }

  network(){
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      let object = {
        id: callbackId,
        name: "network",
        chain: this.chain,
      };
      this.invokeRNMethod(object).then((network) => {
        resolve(network);
      }).catch(error => {
        reject(new PetraError(JSON.parse(error)));
      });
    });
  }

  onNetworkChange(callback) {
    this.networkChangeCallbacks.push(callback);
  }

  // RN -> DAPP
  changeNetwork(network) {
    const callbacks = this.networkChangeCallbacks;
    for (let callback of callbacks) {
      callback(network);
    }
  }


  signMessage(message) {
    console.log("signMessage", message);
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      let object = {
        id: callbackId,
        name: "signMessage",
        object: message,
        chain: this.chain,
      };
      this.invokeRNMethod(object).then(signMessageResponse => {
        console.log("signMessageResponse", { signMessageResponse });
        resolve(signMessageResponse);
      }).catch(error => {
        reject(new PetraError(error));
      });
    });
  }

  signTransaction(transaction) {
    console.log("signTransaction", transaction);
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      if (!transaction) {
        reject(new PetraError("no transaction to sign"));
        return;
      }
      let object = {
        id: callbackId,
        name: "signTransaction",
        object: transaction,
        chain: this.chain,
      };
      this.invokeRNMethod(object).then(signed => {
        console.log("aptosSignTransaction", "sign", signed);
        const sig = new Uint8Array(Buffer.from(signed, "base64"));
        resolve(sig);
      }).catch(error => {
        reject(new PetraError(error));
      });
    });
  }

  signAndSubmitTransaction(transaction) {
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      if (!transaction) {
        reject(new PetraError("no transaction to sign"));
        return;
      }
      let object = {
        id: callbackId,
        name: "signAndSubmitTransaction",
        object: transaction,
        chain: this.chain,
      };
      this.invokeRNMethod(object).then(transaction => {
        resolve(transaction);
      }).catch(error => {
        reject(new PetraError(error));
      });
    });
  }
}

module.exports = FoxWalletAptosProvider;
