"use strict";

import { Buffer } from "buffer";
import { address as btcAddress } from "bitcoinjs-lib";

class Utils {
  static genId() {
    return new Date().getTime() + Math.floor(Math.random() * 1000);
  }

  static flatMap(array, func) {
    return [].concat(...array.map(func));
  }

  static intRange(from, to) {
    if (from >= to) {
      return [];
    }
    return new Array(to - from).fill().map((_, i) => i + from);
  }

  static hexToInt(hexString) {
    if (hexString === undefined || hexString === null) {
      return hexString;
    }
    return Number.parseInt(hexString, 16);
  }

  static intToHex(int) {
    if (int === undefined || int === null) {
      return int;
    }
    let hexString = int.toString(16);
    return "0x" + hexString;
  }

  // message: Bytes | string
  static messageToBuffer(message) {
    var buffer = Buffer.from([]);
    try {
      if (typeof message === "string") {
        buffer = Buffer.from(message.replace("0x", ""), "hex");
      } else {
        buffer = Buffer.from(message);
      }
    } catch (err) {
      console.log(`messageToBuffer error: ${err}`);
    }
    return buffer;
  }

  static bufferToHex(buf) {
    return "0x" + Buffer.from(buf).toString("hex");
  }

  static mapSignatureBack(source, target) {
    source.signatures.map((sig) => {
      const { signature, publicKey } = sig;
      if (signature) {
        target.addSignature(publicKey, signature);
      }
    });
  }

  static resemblesAddress(address) {
    if (typeof address !== "string") {
      return false;
    }
    return address.length === 2 + 20 * 2;
  }

  static uint8ArrayToHex(byteArray) {
    return Array.from(byteArray)
      .map((byte) => {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
      })
      .join("");
  }

  static addHexPrefix(str) {
    if (str.startsWith("0x")) {
      return str;
    }
    return `0x${str}`;
  }

  static getEvmAddress(address) {
    return this.addHexPrefix(
      btcAddress.fromBase58Check(address).hash.toString("hex")
    );
  }

  static emitConnectEvent(chain, config, payload) {
    let object = {
      id: Date.now(),
      name: "connectEvent",
      object: payload,
      config,
      chain: chain,
    };
    console.log(`=== emit connect event ${object}`);
    if (window.foxwallet && window.foxwallet.postMessage) {
      window.foxwallet.postMessage(object);
    }
  }
}

module.exports = Utils;
