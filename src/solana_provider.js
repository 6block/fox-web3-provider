"use strict";
import { EventEmitter } from "events";
import { decode as bs58Decode } from "bs58";
import Utils from "./utils";

class FoxWalletSolanaProvider extends EventEmitter {
  constructor() {
    super();
    this.isFoxWallet = true;
    this.isCloverWallet = true;
    this.isPhantom = true;
    this.isGlow = false;
    this.isConnected = false;

    this.callbacks = new Map();
  }

  connect(hiddenOption) {
    return new Promise((resolve, reject) => {
      this.getAccount(hiddenOption)
        .then((account) => {
          this.isConnected = true;
          this.publicKey = {
            toBytes: () => {
              return bs58Decode(account);
            },
            toJSON: () => {
              return account;
            },
            toString: () => {
              return account;
            },
          };
          this.emit("connect");
          resolve();
        })
        .catch((err) => {
          this.emit("disconnect");
          reject(err);
        });
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      this.isConnected = false;
      this.publicKey = null;
      this.emit("disconnect");
      resolve();
    });
  }

  _handleDisconnect() {}

  invokeRNMethod(payload) {
    return new Promise((resolve1, reject1) => {
      if (window.foxwallet.postMessage) {
        this.callbacks.set(payload.id, (error, data) => {
          if (error) {
            reject1(error);
          } else {
            resolve1(data);
          }
        });
        window.foxwallet.postMessage(payload);
      } else {
        reject1("can not communicate with wallet");
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
          if (frame.solana.callbacks.has(id)) {
            frame.solana.sendResponse(id, result);
          }
        } catch (error) {
          console.log(`send response to frame error: ${error}`);
        }
      }
    }
  }

  getAccount(hiddenOption) {
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      let object = {
        id: callbackId,
        name: "solana.getAccount",
        object: JSON.stringify(hiddenOption),
      };
      this.invokeRNMethod(object)
        .then((account) => {
          resolve(JSON.parse(account));
        })
        .catch((error) => {
          reject(new Error(JSON.parse(error)));
        });
    });
  }

  signMessage(message) {
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      let object = {
        id: callbackId,
        name: "solana.signMessage",
        object: message ? Buffer.from(message).toString("base64") : "",
      };
      this.invokeRNMethod(object)
        .then((message) => {
          const originalParam = JSON.parse(message);
          const sig = new Uint8Array(Buffer.from(originalParam, "base64"));
          console.log("window.foxwallet[callbackId]", callbackId, { sig });
          resolve({ signature: sig });
        })
        .catch((error) => {
          reject(new Error(JSON.parse(error)));
        });
    });
  }

  signTransaction(transaction) {
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      if (!transaction) {
        reject(new Error("no transaction to sign"));
        return;
      }
      const tBuffer = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      let object = {
        id: callbackId,
        name: "solana.signTransaction",
        object: tBuffer.toString("base64"),
      };
      this.invokeRNMethod(object)
        .then((output) => {
          try {
            const signed = transaction.constructor.from(
              new Uint8Array(Buffer.from(JSON.parse(output), "base64"))
            );
            Utils.mapSignatureBack(signed, transaction);
            resolve(transaction);
          } catch (e) {
            reject(new Error("transaction is not valid"));
          }
        })
        .catch((error) => {
          reject(new Error(JSON.parse(error)));
        });
    });
  }

  signAndSendTransaction(transaction, options) {
    return new Promise((resolve, reject) => {
      const callbackId = Utils.genId();
      if (!transaction) {
        reject(new Error("no transaction to sign"));
        return;
      }
      const tBuffer = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      let object = {
        id: callbackId,
        name: "solana.signAndSendTransaction",
        object: { transaction: tBuffer.toString("base64"), options },
      };
      this.invokeRNMethod(object)
        .then((message) => {
          const sig = JSON.parse(message);
          resolve({ signature: sig });
        })
        .catch((error) => {
          reject(new Error(JSON.parse(error)));
        });
    });
  }

  signAllTransactions(transactions) {
    return new Promise((resolve, reject) => {
      if (!transactions || transactions.length === 0) {
        reject(new Error("no transaction to sign"));
      }
      const callbackId = Utils.genId();
      const serialized = transactions.map((transaction) =>
        transaction
          .serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          })
          .toString("base64")
      );
      let object = {
        id: callbackId,
        name: "solana.signAllTransactions",
        object: serialized,
      };
      this.invokeRNMethod(object)
        .then((output) => {
          const outputObj = JSON.parse(output);
          for (let i = 0; i < transactions.length; i++) {
            const signedTransaction = transactions[i].constructor.from(
              Buffer.from(outputObj[i], "base64")
            );
            Utils.mapSignatureBack(signedTransaction, transactions[i]);
          }
          console.log("window.foxwallet[callbackId]", callbackId, {
            transactions,
          });
          resolve(transactions);
        })
        .catch((error) => {
          reject(new Error(JSON.parse(error)));
        });
    });
  }
}

module.exports = FoxWalletSolanaProvider;
