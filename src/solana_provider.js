"use strict";
import { EventEmitter } from "events";
import { decode as bs58Decode } from "bs58";
import Utils from "./utils";
import { Buffer } from "buffer";

function isVersionedTransaction(transaction) {
  return "version" in transaction;
}

class FoxWalletSolanaProvider extends EventEmitter {
  constructor(config) {
    super(config);
    this.isFoxWallet = true;
    this.chain = "SOL";
    this.callbacks = new Map();

    this.isCloverWallet = true;
    this.isPhantom = true;
    this.isGlow = false;
    this.setConfig(config);
  }

  setConfig(config) {
    const solConfig = config[this.chain];
    this.publicKey = solConfig.address
      ? {
          toBytes: () => {
            return bs58Decode(solConfig.address);
          },
          toBase58: () => {
            return solConfig.address;
          },
          toJSON: () => {
            return solConfig.address;
          },
          toString: () => {
            return solConfig.address;
          },
        }
      : null;
    this.isConnected = !!this.publicKey;
  }

  connect(hiddenOption) {
    if (this.publicKey) {
      this.emit("connect", this.publicKey);
      return;
    }
    return new Promise((resolve, reject) => {
      this.getAccount(hiddenOption)
        .then((account) => {
          this.isConnected = true;
          this.publicKey = {
            toBytes: () => {
              return bs58Decode(account);
            },
            toBase58: () => {
              return account;
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
        name: "requestAccounts",
        object: JSON.stringify(hiddenOption),
        chain: this.chain,
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
        name: "signMessage",
        object: message ? Buffer.from(message).toString("base64") : "",
        chain: this.chain,
      };
      this.invokeRNMethod(object)
        .then((message) => {
          const originalParam = JSON.parse(message);
          const sig = new Uint8Array(Buffer.from(originalParam, "base64"));
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
      let tBuffer;
      if (isVersionedTransaction(transaction)) {
        tBuffer = transaction.serialize();
      } else {
        tBuffer = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });
      }
      let object = {
        id: callbackId,
        name: "signTransaction",
        object: Buffer.from(tBuffer).toString("base64"),
        chain: this.chain,
      };
      this.invokeRNMethod(object)
        .then((output) => {
          try {
            let buffer = Buffer.from(JSON.parse(output), "base64");
            let signed;
            if (transaction.constructor.deserialize) {
              // VersionedTransaction
              let signed = transaction.constructor.deserialize(
                new Uint8Array(buffer)
              );
              resolve(signed);
            } else {
              signed = transaction.constructor.from(new Uint8Array(buffer));
              Utils.mapSignatureBack(signed, transaction);
              resolve(transaction);
            }
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
      let tBuffer;
      if (isVersionedTransaction(transaction)) {
        tBuffer = transaction.serialize();
      } else {
        tBuffer = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });
      }
      let object = {
        id: callbackId,
        name: "signAndSendTransaction",
        object: {
          transaction: Buffer.from(tBuffer).toString("base64"),
          options,
        },
        chain: this.chain,
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
      const serialized = transactions.map((transaction) => {
        if (isVersionedTransaction(transaction)) {
          return Buffer.from(transaction.serialize()).toString("base64");
        }
        return transaction
          .serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          })
          .toString("base64");
      });
      let object = {
        id: callbackId,
        name: "signAllTransactions",
        object: serialized,
        chain: this.chain,
      };
      this.invokeRNMethod(object)
        .then((output) => {
          const outputObj = JSON.parse(output);
          for (let i = 0; i < transactions.length; i++) {
            let signedTransaction;
            if (transactions[i].constructor.deserialize) {
              signedTransaction = transactions[i].constructor.deserialize(
                Buffer.from(outputObj[i], "base64")
              );
            } else {
              signedTransaction = transactions[i].constructor.from(
                Buffer.from(outputObj[i], "base64")
              );
              Utils.mapSignatureBack(signedTransaction, transactions[i]);
            }
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
