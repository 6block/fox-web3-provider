"use strict";

import { EventEmitter } from "events";

class BaseProvider extends EventEmitter {
  constructor() {
    super();
    this.isDebug = true;
    this.isFoxWallet = true;
  }

  /**
   * @private Internal js -> native message handler
   */
  postMessage(handler, id, data, requestId) {
    let object = {
      id: id,
      name: handler,
      object: data,
      chain: this.chain,
      requestId, // for ton as event counter
    };
    if (window.foxwallet.postMessage) {
      window.foxwallet.postMessage(object);
    } else {
      console.error("postMessage is not available");
    }
  }

  /**
   * @private Internal native result -> js
   */
  sendResponse(id, result) {
    let callback = this.callbacks.get(id);
    if (this.isDebug) {
      console.log(
        `<== sendResponse id: ${id}, result: ${JSON.stringify(result)}`
      );
    }
    if (callback) {
      callback(null, result);
      this.callbacks.delete(id);
    } else {
      console.log(`callback id: ${id} not found`);
    }
  }

  /**
   * @private Internal native error -> js
   */
  sendError(id, error) {
    console.log(`<== ${id} sendError ${error}`);
    let callback = this.callbacks.get(id);
    if (callback) {
      callback(error instanceof Error ? error : new Error(error), null);
      this.callbacks.delete(id);
    }
  }
}

module.exports = BaseProvider;
