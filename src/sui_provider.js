import {
  ReadonlyWalletAccount,
  SUI_DEVNET_CHAIN,
  SUI_TESTNET_CHAIN,
  SUI_LOCALNET_CHAIN,
  SUI_MAINNET_CHAIN,
} from "@mysten/wallet-standard";
import {  toB64, TransactionBlock } from "@mysten/sui.js";
import BaseProvider from "./base_provider";
import Utils from "./utils";

export const API_ENV = {
  local: "local",
  devnet :"devnet",
  testnet :"testnet",
  mainnet :"mainnet",
};


const API_ENV_TO_CHAIN = {
    [API_ENV.local]: SUI_LOCALNET_CHAIN,
    [API_ENV.devnet]: SUI_DEVNET_CHAIN,
    [API_ENV.testnet]: SUI_TESTNET_CHAIN,
    [API_ENV.mainnet]: SUI_MAINNET_CHAIN,
};

export class SuiProvider extends BaseProvider  {
  constructor() {
    super();
    this.chain = "SUI";
    this.version = "1.0.0";
    this.name = "Sui Wallet";
    this.callbacks = new Map();
    this.icon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCA5MDAgOTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjkwMCIgcng9IjQ1MCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01NzcuMjQ5IDIxNS45NzVDNTM5Ljk1NiAxOTYuMjMyIDUxMS42NDYgMTYxLjU0OSA1MDAuNDY4IDExOS44NjhDNDk3LjAyMSAxMzIuNjEzIDQ5NS4yNDUgMTQ1Ljk4NCA0OTUuMjQ1IDE1OS43NzRDNDk1LjI0NSAxNzAuNTMzIDQ5Ni4zOTQgMTgwLjk4IDQ5OC40ODMgMTkxLjExM0M0OTguNDgzIDE5MS4xMTMgNDk4LjQ4MyAxOTEuMTEzIDQ5OC40ODMgMTkxLjIxN0M0OTguNDgzIDE5MS4zMjIgNDk4LjU4OCAxOTEuNTMxIDQ5OC41ODggMTkxLjYzNUM1MDEuNDA4IDIwNS4yMTYgNTA2LjAwNSAyMTguMDY1IDUxMi4xNjggMjI5Ljk3NEM0OTkuMDA2IDIyMC4yNTggNDg3LjMwNiAyMDguNjYzIDQ3Ny40ODYgMTk1LjYwNUM0NjQuMzIzIDI5Ny42NjcgNTAxLjQwOCA0MDMuOTA3IDU2OS4yMDYgNDczLjg5OEM2NTcuNjg3IDU3Ni45IDU3Ni4xIDc1MS42NjkgNDM4LjIwNyA3NDcuMDczQzI0My4wNjggNzQ4Ljc0NCAyMDkuNjM5IDQ2MS4zNjIgMzk2LjgzOSA0MTYuMjM0TDM5Ni43MzUgNDE1LjcxMUM0NDYuNjY5IDM5OS41MTkgNDcwLjA2OSAzNjcuMDMxIDQ3NC4xNDMgMzI0LjgyN0M0MDIuMDYzIDM4My4yMjMgMjg4LjE5NiAzMTAuODI5IDMxMS44MDUgMjIwLjE1NEM0MS4yNDI1IDM1My4zNDYgMTQxLjczNyA3ODUuNDExIDQ0OC40NDUgNzgwLjA4M0M1ODIuMDU1IDc4MC4wODMgNjk1LjA4NSA2OTEuNzA2IDczMi4xNyA1NzAuMjE0Qzc3Ni40NjMgNDI4LjU2MSA3MDQuOCAyNzcuNjA5IDU3Ny4yNDkgMjE1Ljk3NVoiIGZpbGw9IiMxMkZFNzQiLz4KPC9zdmc+Cg==";
    this.chains = ["sui:devnet"];
    this.innerAccounts = [];
    this.features = {
      "standard:connect": {
          version: "1.0.0",
          connect: this.connect.bind(this),
      },
      "standard:events": {
          version: "1.0.0",
          on: this.on.bind(this),
      },
      "sui:signTransactionBlock": {
          version: "2.0.0",
          signTransactionBlock: this.signTransactionBlock.bind(this),
      },
      "sui:signAndExecuteTransactionBlock": {
          version: "1.0.0",
          signAndExecuteTransactionBlock: this.signAndExecuteTransactionBlock.bind(this),
      },
      "suiWallet:stake": {
          version: "0.0.1",
          stake: this.stake.bind(this),
      },
      "sui:signMessage": {
        version: "1.0.0",
        signMessage: this.signMessage.bind(this),
    },
    };
  }

  get accounts() {
    return this.innerAccounts;
  }

  setAccounts(addresses) {
    this.innerAccounts = addresses.map(
        (address) =>
            new ReadonlyWalletAccount({
                address,
                // TODO: Expose public key instead of address:
                publicKey: new Uint8Array(),
                chains: this.activeChain ? [this.activeChain] : [],
                features: ["sui:signAndExecuteTransaction"],
            })
    );
  }

  on(event, listener) {
    super.on(event, listener);
    return () => super.off(event, listener);
  }

  async connect(input) {
    console.log("==> connect input: ", input);
    if (!input || !input.slient) {
      await this.requestPermissions([
        "viewAccount",
        "suggestTransactions",
      ]);
    }
    await this.connected();
    return { accounts: this.innerAccounts };
  }

  async connected() {
    console.log("==> connected");

    this.setActiveChain(await this.getActiveNetwork());
    if (!(await this.hasPermissions(["viewAccount"]))) {
      return;
    }
    const accounts = await this.getAccounts();
    this.setAccounts(accounts);
    if (this.innerAccounts && this.innerAccounts.length) {
      this.emit("change", { accounts: this.innerAccounts });
    }
  }

  async signTransactionBlock(tx) {
    if (!TransactionBlock.is(tx.transactionBlock)) {
      throw new Error(
        "Unexpect transaction format found. Ensure that you are using the `Transaction` class."
      );
    }
    tx.account = (tx.account && tx.account.address) || (this.accounts[0] && this.accounts[0].address) || "",
    tx.transaction = tx.transactionBlock.serialize();
    return this.send("signTransactionBlock", tx);
  }

  async signAndExecuteTransactionBlock(input) {
    if (!TransactionBlock.is(input.transactionBlock)) {
      throw new Error(
          "Unexpect transaction format found. Ensure that you are using the `Transaction` class."
      );
    }
    const tx = {
      type: "transaction",
      data: input.transactionBlock.serialize(),
      options: input.options,
      account: (input.account && input.account.address) || (this.accounts[0] && this.accounts[0].address) || "",
    };
    return this.send("signAndExecuteTransactionBlock", tx);
  }

  async stake (input) {
    return this.send({
        type: "stake",
        validatorAddress: input.validatorAddress,
    });
  }

  async signMessage({ message, account }) {
    return this.send("signMessage", {
      message: toB64(message),
      accountAddress: account.address,
    });
  }

  async requestPermissions(permissions) {
    console.log("==> requestPermissions", permissions);

    return this.send("acquirePermissions", [
      "viewAccount",
      "suggestTransactions",
    ]);
  }

  async hasPermissions(permissions) {
    console.log("==> hasPermissions");

    return this.send("hasPermissions", permissions);
  }

  async getAccounts() {
    console.log("==> getAccounts");
    return this.send("getAccounts");
  }

  getActiveNetwork() {
    console.log("==> getActiveNetwork");
    return this.send("getNetwork");
  }

  setActiveChain({ env }) {
    this.activeChain = API_ENV_TO_CHAIN[env];
  }


  send(method, params) {
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
