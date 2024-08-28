import BaseProvider from "./base_provider";
import Utils from "./utils";

export class AppProvider extends BaseProvider  {
  constructor() {
    super();
    this.isFoxWallet = true;
    this.chain = "app";
    this.callbacks = new Map();
  }

  /**
   * todo: ope the share pannel
   * @param {*} params 
   * @returns 
   */
  async share(params) {
    return await this.send("share", params);
  }

  /**
   * Get current user's Did
   */
  async getUserDid() {
    return await this.send("getUserDid");
  }

  /**
   * Get current user's configuration, such as language, currency.
   */
  async getUserConfig() {
    return await this.send("getUserConfig");
  }

  linkTo(url) {
    this.send("linkTo", url);
  }

  send(method, params) {
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
