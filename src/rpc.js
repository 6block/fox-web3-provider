"use strict";

class RPCServer {
  constructor(rpcUrlList) {
    this.rpcUrlList = rpcUrlList;
    this.currentRpcIndex = 0;
  }

  getBlockNumber() {
    return this.call({
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
    }).then((json) => json.result);
  }

  getBlockByNumber(number) {
    return this.call({
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [number, false],
    }).then((json) => json.result);
  }

  getFilterLogs(filter) {
    return this.call({
      jsonrpc: "2.0",
      method: "eth_getLogs",
      params: [filter],
    });
  }

  call(payload, attempt = 1) {
    return fetch(this.rpcUrlList[this.currentRpcIndex], {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.result && json.error) {
          console.log("<== rpc error", json.error);
          throw new Error(json.error.message || "rpc error");
        }
        return json;
      })
      .catch((error) => {
        console.log(
          `Error with RPC URL: ${
            this.rpcUrlList[this.currentRpcIndex]
          }. Attempt ${attempt} failed with ${error}.`
        );
        if (attempt < 3) {
          this.currentRpcIndex =
            (this.currentRpcIndex + 1) % this.rpcUrlList.length;
          return this.call(payload, attempt + 1);
        } else {
          throw new Error("All RPC URLs failed after 3 attempts.");
        }
      });
  }
}

module.exports = RPCServer;
