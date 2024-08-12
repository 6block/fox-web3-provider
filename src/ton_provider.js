import BaseProvider from "./base_provider";
import Utils from "./utils";

const CURRENT_PROTOCOL_VERSION = 2;

export class TONProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.isFoxWallet = true;
    this.chain = "TON";
    this.callbacks = new Map();
    this.setConfig(config);
    this.dappListeners = [];
  }

  setConfig(config) {
    const tonConfig = config[this.chain];
    this.deviceInfo = tonConfig.deviceInfo;
    this.walletInfo = tonConfig.walletInfo;
    this.protocolVersion = tonConfig.protocolVersion || CURRENT_PROTOCOL_VERSION;
    this.isWalletBrowser = tonConfig.isWalletBrowser ?? true;

    this.publicKey = tonConfig.publicKey;
    this.isConnected = !!this.publicKey;
    this.config = tonConfig;
  }

  // connect(protocolVersion: number, message: ConnectRequest): Promise<ConnectEvent>;
  async connect(protocolVersion, message, auto)  {
    console.log("connect===>", protocolVersion, message);
    return await this.sendRNMethod("connect",{protocolVersion, message, auto});
  }
  // restoreConnection(): Promise<ConnectEvent>;
  async restoreConnection(){
    console.log("restoreConnection===>");
    return await this.sendRNMethod("restoreConnection");

  }
  // send(message: AppRequest): Promise<WalletResponse>;
  async send(message){
    console.log("send===>", message);
    console.log("send===> json:", JSON.stringify(message));
    return await this.sendRNMethod("send", { message });
  }
  // disconnect(): Promise<void>;
  async disconnect(){
    console.log("disconnect===>");
    return await this.sendRNMethod("disconnect");
  }

  // listen(callback: (event: WalletEvent) => void): () => void;
  //listen===> e => {
  //       if (this.listenSubscriptions) {
  //         this.listeners.forEach(listener => listener(e));
  //       }
  //       if (e.event === 'disconnect') {
  //         this.disconnect();
  //       }
  //     }
  listen(callback) {
    this.dappListeners.push(callback);
  }

  emit(event, ...args) {
    console.log(`=== emit event ${event} ${args}`);
    super.emit(event, ...args);
    this.dappListeners.forEach(listener => listener({event,...args}));
  }

  sendRNMethod(method, params) {
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
