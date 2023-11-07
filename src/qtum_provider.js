"use strict";

import RPCServer from "./rpc";
import ProviderRpcError from "./error";
import Utils from "./utils";
import IdMapping from "./id_mapping";
import isUtf8 from "isutf8";
import { TypedDataUtils, SignTypedDataVersion } from "@metamask/eth-sig-util";
import BaseProvider from "./base_provider";

class FoxQtumProvider extends BaseProvider {
  constructor(config) {
    super();
    this.setConfig(config);

    this.isFoxWallet = true;
    this.chain = "QTUM";
    this.idMapping = new IdMapping();
    this.callbacks = new Map();
    this.wrapResults = new Map();
    this.isMetaMask = !!config.qtum.isMetaMask;

    this.emitConnect(this.chainId);
  }

  setAddress(address) {
    const lowerAddress = (address || "").toLowerCase();
    this.address = lowerAddress;
    this.ready = true;
    try {
      for (var i = 0; i < window.frames.length; i++) {
        const frame = window.frames[i];
        if (frame.qtum && frame.qtum.isFoxWallet) {
          frame.qtum.address = lowerAddress;
          frame.qtum.ready = !!address;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  setConfig(config) {
    this.setAddress(config.qtum.address);

    this.networkVersion = "" + config.qtum.chainId;
    this.chainId = "0x" + (config.qtum.chainId || 81).toString(16);
    this.rpc = new RPCServer(config.qtum.rpcUrl);
    this.isDebug = !!config.isDebug;
  }

  request(payload) {
    // this points to window in methods like web3.eth.getAccounts()
    var that = this;
    if (!(this instanceof FoxQtumProvider)) {
      that = window.qtum;
    }
    return that._request(payload, false);
  }

  /**
   * @deprecated Listen to "connect" event instead.
   */
  isConnected() {
    return true;
  }

  /**
   * @deprecated Use request({method: "eth_requestAccounts"}) instead.
   */
  enable() {
    console.log(
      "enable() is deprecated, please use window.qtum.request({method: 'eth_requestAccounts'}) instead."
    );
    return this.request({ method: "eth_requestAccounts", params: [] });
  }

  /**
   * @deprecated Use request() method instead.
   */
  send(payload) {
    if (this.isDebug) {
      console.log(`==> send payload ${JSON.stringify(payload)}`);
    }
    let response = { jsonrpc: "2.0", id: payload.id };
    switch (payload.method) {
      case "eth_accounts":
        response.result = this.eth_accounts();
        break;
      case "eth_coinbase":
        response.result = this.eth_coinbase();
        break;
      case "net_version":
        response.result = this.net_version();
        break;
      case "eth_chainId":
        response.result = this.eth_chainId();
        break;
      default:
        throw new ProviderRpcError(
          4200,
          `Fox does not support calling ${payload.method} synchronously without a callback. Please provide a callback parameter to call ${payload.method} asynchronously.`
        );
    }
    return response;
  }

  /**
   * @deprecated Use request() method instead.
   */
  sendAsync(payload, callback) {
    console.log(
      "sendAsync(data, callback) is deprecated, please use window.qtum.request(data) instead."
    );
    // this points to window in methods like web3.eth.getAccounts()
    var that = this;
    if (!(this instanceof FoxQtumProvider)) {
      that = window.qtum;
    }
    if (Array.isArray(payload)) {
      Promise.all(payload.map((_payload) => that._request(_payload)))
        .then((data) => callback(null, data))
        .catch((error) => callback(error, null));
    } else {
      that
        ._request(payload)
        .then((data) => callback(null, data))
        .catch((error) => callback(error, null));
    }
  }

  /**
   * @private Internal rpc handler
   */
  _request(payload, wrapResult = true) {
    this.idMapping.tryIntifyId(payload);
    if (this.isDebug) {
      console.log(`==> _request payload ${JSON.stringify(payload)}`);
    }
    this.fillJsonRpcVersion(payload);
    return new Promise((resolve, reject) => {
      if (!payload.id) {
        payload.id = Utils.genId();
      }
      this.callbacks.set(payload.id, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
      this.wrapResults.set(payload.id, wrapResult);

      switch (payload.method) {
        case "eth_accounts":
          return this.sendResponse(payload.id, this.eth_accounts());
        case "eth_coinbase":
          return this.sendResponse(payload.id, this.eth_coinbase());
        case "net_version":
          return this.sendResponse(payload.id, this.net_version());
        case "eth_chainId":
          return this.sendResponse(payload.id, this.eth_chainId());
        case "btc_sign":
          throw new ProviderRpcError(
            4200,
            "Fox does not support btc_sign. Please use other sign method instead."
          );
        case "eth_sign":
          throw new ProviderRpcError(
            4200,
            "Fox does not support eth_sign. Please use other sign method instead."
          );
        case "personal_sign":
          return this.personal_sign(payload, false);
        case "personal_ecRecover":
          return this.personal_ecRecover(payload, false);
        case "eth_signTypedData_v3":
          return this.eth_signTypedData(payload, SignTypedDataVersion.V3, false);
        case "eth_signTypedData_v4":
          return this.eth_signTypedData(payload, SignTypedDataVersion.V4, false);
        case "eth_signTypedData":
          return this.eth_signTypedData(payload, SignTypedDataVersion.V1, false);
        case "btc_personalSign":
          return this.personal_sign(payload, true);
        case "btc_ecRecover":
          return this.personal_ecRecover(payload, true);
        case "btc_signTypedData_v3":
          return this.eth_signTypedData(payload, SignTypedDataVersion.V3, true);
        case "btc_signTypedData_v4":
          return this.eth_signTypedData(payload, SignTypedDataVersion.V4, true);
        case "btc_signTypedData":
          return this.eth_signTypedData(payload, SignTypedDataVersion.V1, true);
        case "eth_sendTransaction":
          return this.eth_sendTransaction(payload);
        case "eth_requestAccounts":
          return this.eth_requestAccounts(payload);
        case "wallet_watchAsset":
          return this.wallet_watchAsset(payload);
        case "wallet_addEthereumChain":
          return this.wallet_addEthereumChain(payload);
        case "wallet_switchEthereumChain":
          return this.wallet_switchEthereumChain(payload);
        case "eth_newFilter":
        case "eth_newBlockFilter":
        case "eth_newPendingTransactionFilter":
        case "eth_uninstallFilter":
        case "eth_subscribe":
          throw new ProviderRpcError(
            4200,
            `Fox does not support calling ${payload.method}. Please use your own solution`
          );
        default:
          // call upstream rpc
          this.callbacks.delete(payload.id);
          this.wrapResults.delete(payload.id);
          payload.jsonrpc = "2.0";
          return this.rpc
            .call(payload)
            .then((response) => {
              if (this.isDebug) {
                console.log(`<== rpc response ${JSON.stringify(response)}`);
              }
              wrapResult ? resolve(response) : resolve(response.result);
            })
            .catch(reject);
      }
    });
  }

  fillJsonRpcVersion(payload) {
    if (payload.jsonrpc === undefined) {
      payload.jsonrpc = "2.0";
    }
  }

  emitConnect(chainId) {
    this.emit("connect", { chainId: chainId });
  }

  emitChainChanged(chainId) {
    console.log("emitChainChanged", chainId);
    this.emit("chainChanged", chainId);
    this.emit("networkChanged", chainId);
  }

  eth_accounts() {
    return this.address ? [this.address] : [];
  }

  eth_coinbase() {
    return this.address;
  }

  net_version() {
    return this.networkVersion;
  }

  eth_chainId() {
    return this.chainId;
  }

  eth_sign(payload, btcSign) {
    const buffer = Utils.messageToBuffer(payload.params[1]);
    const hex = Utils.bufferToHex(buffer);
    if (isUtf8(buffer)) {
      this.postMessage("signPersonalMessage", payload.id, { data: hex, btcSign });
    } else {
      this.postMessage("signMessage", payload.id, { data: hex, btcSign });
    }
  }

  personal_sign(payload, btcSign) {
    const firstParam = payload.params[0];
    const secondParam = payload.params[1];
    let message = firstParam;
    if (
      Utils.resemblesAddress(firstParam) &&
      !Utils.resemblesAddress(secondParam)
    ) {
      message = secondParam;
    }
    const buffer = Utils.messageToBuffer(message);
    if (buffer.length === 0) {
      // hex it
      const hex = Utils.bufferToHex(message);
      this.postMessage("signPersonalMessage", payload.id, { data: hex, btcSign });
    } else {
      this.postMessage("signPersonalMessage", payload.id, { data: message, btcSign });
    }
  }

  personal_ecRecover(payload, btcSign) {
    this.postMessage("ecRecover", payload.id, {
      signature: payload.params[1],
      message: payload.params[0],
      from: payload.params[2],
      btcSign,
    });
  }

  eth_signTypedData(payload, version, btcSign) {
    let address;
    let data;

    const firstParam = payload.params[0];
    const secondParam = payload.params[1];
    if (
      Utils.resemblesAddress(firstParam) &&
      !Utils.resemblesAddress(secondParam)
    ) {
      data = payload.params[1];
      address = payload.params[0];
    }else {
      data = payload.params[0];
      address = payload.params[1];
    }

    const message = typeof data === "string" ? JSON.parse(data) : data;

    const { chainId } = message.domain || {};

    if (!!chainId && Number(chainId) !== Number(this.chainId)) {
      throw new Error(
        "Provided chainId does not match the currently active chain"
      );
    }

    const hash =
      version !== SignTypedDataVersion.V1
        ? TypedDataUtils.eip712Hash(message, version)
        : "";

    const SIGN_TYPED_MESSAGE = "signTypedMessage";
    const SIGN_TYPED_MESSAGE_V1 = "signTypedMessageV1";
    const SIGN_TYPED_MESSAGE_V3 = "signTypedMessageV3";
    const SIGN_TYPED_MESSAGE_V4 = "signTypedMessageV4";

    let method = "signTypedMessage";
    switch (version) {
      case SignTypedDataVersion.V1:
        method = SIGN_TYPED_MESSAGE_V1;
        break;
      case SignTypedDataVersion.V3:
        method = SIGN_TYPED_MESSAGE_V3;
        break;
      case SignTypedDataVersion.V4:
        method = SIGN_TYPED_MESSAGE_V4;
        break;
      default:
        method = SIGN_TYPED_MESSAGE;
        break;
    }
    this.postMessage(method, payload.id, {
      data: "0x" + hash.toString("hex"),
      raw: typeof data === "string" ? data : JSON.stringify(data),
      address,
      version,
      btcSign,
    });
  }

  eth_sendTransaction(payload) {
    this.postMessage("signTransaction", payload.id, payload.params[0]);
  }

  eth_requestAccounts(payload) {
    this.postMessage("requestAccounts", payload.id, {});
  }

  wallet_watchAsset(payload) {
    let options = payload.params.options;
    this.postMessage("watchAsset", payload.id, {
      type: payload.type,
      contract: options.address,
      symbol: options.symbol,
      decimals: options.decimals || 0,
      image: options.image || "",
    });
  }

  wallet_addEthereumChain(payload) {
    this.postMessage("addEthereumChain", payload.id, payload.params[0]);
  }

  wallet_switchEthereumChain(payload) {
    this.postMessage("switchEthereumChain", payload.id, payload.params[0]);
  }

  /**
   * @private Internal js -> native message handler
   */
  postMessage(handler, id, data) {
    console.log("====> hander: ", handler);
    if (
      this.ready ||
      handler === "requestAccounts" ||
      handler === "switchEthereumChain"
    ) {
      let object = {
        id: id,
        name: handler,
        object: data,
        chain: this.chain,
      };
      if (window.foxwallet.postMessage) {
        window.foxwallet.postMessage(object);
      } else {
        // old clients
        window.webkit.messageHandlers[handler].postMessage(object);
      }
    } else {
      // don't forget to verify in the app
      this.sendError(id, new ProviderRpcError(4100, "provider is not ready"));
    }
  }

  /**
   * @private Internal native result -> js
   */
  sendResponse(id, result) {
    let originId = this.idMapping.tryPopId(id) || id;
    let callback = this.callbacks.get(id);
    let wrapResult = this.wrapResults.get(id);
    let data = { jsonrpc: "2.0", id: originId };
    if (
      result !== null &&
      typeof result === "object" &&
      result.jsonrpc &&
      result.result
    ) {
      data.result = result.result;
    } else {
      data.result = result;
    }
    if (this.isDebug) {
      console.log("<== wrapResult: ", wrapResult);
      console.log(
        `<== sendResponse id: ${id}, result: ${JSON.stringify(
          result
        )}, data: ${JSON.stringify(data)}`
      );
    }
    if (callback) {
      wrapResult ? callback(null, data) : callback(null, result);
      this.callbacks.delete(id);
    } else {
      console.log(`callback id: ${id} not found`);
      // check if it's iframe callback
      for (var i = 0; i < window.frames.length; i++) {
        const frame = window.frames[i];
        try {
          if (frame.qtum.callbacks.has(id)) {
            frame.qtum.sendResponse(id, result);
          }
        } catch (error) {
          console.log(`send response to frame error: ${error}`);
        }
      }
    }
  }

  emit(event, ...args) {
    console.log(`=== emit event ${event} ${args}`);
    super.emit(event, ...args);
  }
}

module.exports = FoxQtumProvider;