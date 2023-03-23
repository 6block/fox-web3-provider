import {
  ReadonlyWalletAccount,
  SUI_DEVNET_CHAIN,
  SUI_TESTNET_CHAIN,
  SUI_LOCALNET_CHAIN,
} from "@mysten/wallet-standard";
import BaseProvider from "./base_provider";
import Utils from "./utils";

export const API_ENV = {
  local: "local",
  devnet :"devnet",
  testnet :"testnet",
};


const API_ENV_TO_CHAIN = {
    [API_ENV.local]: SUI_LOCALNET_CHAIN,
    [API_ENV.devnet]: SUI_DEVNET_CHAIN,
    [API_ENV.testnet]: SUI_TESTNET_CHAIN,
};

export class SuiProvider extends BaseProvider  {
  constructor() {
    super();
    this.chain = "SUI";
    this.version = "1.0.0";
    this.name = "FoxWallet";
    this.callbacks = new Map();
    this.icon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDciIHZpZXdCb3g9IjAgMCA0NSA0NyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNy43Nzg5IDI2LjEzNDRDMTcuODggMjYuMTY3NSAxNy45ODQ0IDI2LjE4OTcgMTguMDkwMiAyNi4yMDA4QzE4LjA5MDIgMjYuMjAwOCAxNy42NTE3IDI2LjM2NTEgMTYuNzQ0NSAyNi4wNTc5QzE2Ljc0NDUgMjYuMDU3OSAxNi4wNjU3IDI1Ljc4MTcgMTUuNTU2OSAyNS44MjgxQzE0Ljk2NiAyNS44ODE1IDE0LjU1ODUgMjYuNjQ5NyAxNC41NTg1IDI2LjY0OTdDMTQuNjc1MiAyNi41ODY1IDE0Ljc5OTEgMjYuNTM3NyAxNC45Mjc1IDI2LjUwNDFDMTUuMzMwMSAyNi40MjIzIDE1LjE5MTEgMjYuNDkwNiAxNS4xOTExIDI2LjQ5MDZDMTUuMTkxMSAyNi40OTA2IDE0LjQxNyAyNi44MTUgMTQuMzY0MyAyNy4xMDM1QzE0LjM1MTcgMjcuMTc1NSAxNC41Njg1IDI2Ljk3MjMgMTUuMTQwOSAyNi45OTAzQzE1Ljg0MzkgMjcuMDEyNCAxNi40NTQ5IDI3LjQyMDQgMTYuNzA1OSAyNy40ODc3QzE3LjIyMDYgMjcuNjI1NCAxNy45NTg4IDI3LjY1NjggMTguNjM1OSAyNy4xMjU5QzE4LjYzNTkgMjcuMTI1OSAxOS4yNjEgMjYuNzMzOCAxOS40NTQ0IDI2LjAwOTRDMTkuNTA0NCAyNS44MDg0IDE5LjUzMzggMjUuNjAyOSAxOS41NDIyIDI1LjM5NkMxOS41NDU0IDI1LjIxMzkgMTkuNTI2OCAyNS4wMzIxIDE5LjQ4NyAyNC44NTQ0QzE5LjQ4NyAyNC44NTQ0IDE5LjEyMTMgMjUuNzAxMyAxNy43Nzg5IDI2LjEzNDRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMxLjA3NDYgMzQuMDgwMUMzMi40Mzg0IDMyLjM3MDUgMzMuMTgxMSAzMC4yNDgzIDMzLjE4MTEgMjguMDYxM0MzMy4xODExIDI1Ljg3NDMgMzIuNDM4NCAyMy43NTIyIDMxLjA3NDYgMjIuMDQyNUwzOS44MTExIDIxLjA4MTVDMzkuODExMSAyMS4wODE1IDQwLjcxOTIgMjMuNTcxOSA0MC45NTg1IDI0LjkwMzVDNDAuOTg5NSAyNS4wNzQyIDQxLjA0MyAyNS40MTc5IDQxLjA0MyAyNS40MTc5QzQxLjA0MyAyNS40MTc5IDM5LjY4ODEgMjguNzA3OSAzNy42MDc1IDMwLjUxNTdDMzQuODExNCAzMi45NDU1IDMxLjA3NDYgMzQuMDgwMSAzMS4wNzQ2IDM0LjA4MDFaTTEwLjM4NjggMzMuOTYwMUw3LjAzODE0IDM0LjU4MDlDNS45NzU1IDMxLjg4OTkgNS41ODcyIDI4Ljk3OTkgNS45MDcxMiAyNi4xMDQ1QzYuMjI3MDMgMjMuMjI5MSA3LjI0NTQ0IDIwLjQ3NTYgOC44NzM1NiAxOC4wODRDOC45NDQyOCAxNy45ODAzIDkuMDg5MDYgMTcuNzc1NCA5LjA4OTA2IDE3Ljc3NTRMMTIuNzg5IDI4LjE5NTNMMTAuMzg2OCAzMy45NjAxWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzBfMSkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMi41MDA2IDEyLjU5MTNDMjIuNTExNSAxMi41NzcxIDIyLjUyMDcgMTIuNTcwOCAyMi41MzI0IDEyLjU1NjVDMjIuNjIyIDEyLjQ2MTggMjQuNzAwOCAxMC4yMjQ3IDIyLjIyMTkgNi40NDEwOEMyMC4zOTI0IDMuNjUwOTEgMTUuNzM0MiAzLjcyOTQ5IDEzLjgzMjggMi4yNzczN0MxMy45NzM0IDMuMzk1OSAxNS4wNjk3IDQuNDA0MTMgMTQuOTUwOSA1LjkzNjkyQzE0LjkwNDMgNi40NDIwNyAxNC44MDk4IDYuOTQxNjYgMTQuNjY4OCA3LjQyODk2QzE0LjQ0MiA4LjMwNDAzIDE0LjIzMjggOS4xMzM3NSAxNC41NDY2IDEwLjc2NDdDMTQuNzkxOSAxMi4wMzU0IDE1LjM3MSAxMi45NjI1IDE2LjI2OTggMTMuNTIwNUMxNy4yOTg0IDE0LjE1ODIgMTguNzIyOCAxNC4yOTgzIDIwLjE4NDEgMTMuOTAwOUMyMS4xNjMyIDEzLjYzNDYgMjIuMDI5NCAxMy4xNDI3IDIyLjUwMDYgMTIuNTkxM1oiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8wXzEpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjUuNjAyMSAxMC45NTk0QzI2LjEzNjEgMTAuMDM3OSAyNi4yMzc0IDguOTYyNzYgMjUuOTA5MyA3Ljc3MDI1QzI1LjQ1MjMgNi4xMDQxNCAyNC41Nzk0IDUuMDExNjQgMjMuODc1NiA0LjEzMzE0QzIzLjY1NTUgMy44NTUxMSAyMy40NDcxIDMuNTk1OTMgMjMuMjgwNiAzLjM1MTU1QzIyLjYxMTQgMi4zNzEwNyAyMi4zMjMgMS4xODAwNyAyMi40Njk2IDAuMDAyMDc1MkMyMS42MjEgMC42MTE4NDYgMTkuOTg4MiAxLjc2NTI3IDE4Ljk0MjkgMi45OTI4NUMyMC40NTE4IDMuNzE1NiAyMS42MjkzIDQuNTA0MyAyMi41NjI1IDUuOTI1ODhDMjQuMTUwMSA4LjM0NzA1IDI0LjEyNSAxMC4zMDQxIDIzLjgyMzcgMTEuNTE5MUMyMy43MzkyIDExLjg1MzkgMjQuMzc5NCAxMi4xNSAyNC4yNjA2IDEyLjQwOTJDMjQuODAyOCAxMi4wMjM0IDI1LjI1OTUgMTEuNTI5OCAyNS42MDIxIDEwLjk1OTRaIiBmaWxsPSJ1cmwoI3BhaW50Ml9saW5lYXJfMF8xKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTM3LjE3MzIgMjEuMDE4MkMzNS4zOTg5IDIwLjg0OTQgMzEuODA1MyAyMC40MTI1IDMxLjgwNTMgMjAuNDEyNUMyMy43MjI0IDE5Ljk2MjIgMTkuMTM1MyAyMi4zODgxIDE1LjY3MTMgMjUuNTYyQzEyLjk5ODMgMjguMjE2MiAxMC42MTgxIDM1LjA5ODkgMTAuNjE4MSAzNS4wOTg5TDcuNzIyOSAzNC45NDE4QzcuNzIyOSAzNC45NDE4IDguNjQ1NDIgMzIuMTk1NCA5LjcxMTIzIDMwLjE5NzdDMTAuOTMzMSAyNy45MDc0IDExLjIwNzYgMjguMDk0NiAxMC45MzAyIDI3LjcxMzJDOS42MzgyNSAyNS45MzczIDkuMDMyODMgMjQuNTQxNyA4LjUxMzI3IDIxLjU1NjZDOC41MTMyNyAyMS41NTY2IDkuMTIxMDQgMjIuMDMzNyA5LjU4MDc1IDIxLjc0MjRDOS41ODA3NSAyMS43NDI0IDguNTM2NTQgMTkuOTMgOC4zNzU2MSAxNy45NzUzQzguMDkwMyAxNC41MSA5LjcxMzIzIDkuNzggOS43NTA5IDkuNjcwODdDOS43MzU0MSA5LjcyMDUgOS42NDg1NCAxMC4xMjcyIDEwLjYwMDkgMTAuNzM0MkMxMC42NjkxIDEwLjQ0NzcgMTAuNzQxMyAxMC4xNjc1IDEwLjgxNzYgOS44OTM4MkMxMS4xNTM0IDguMjU4OTIgMTIuMDQ4NCA0LjY5MDUxIDEzLjgzOTQgMi4yNzExOEMxMy44Mzk0IDIuMjcxMTggMTQuODQxMSA1Ljc2ODg3IDE3LjM1NjkgNy4zNTUzOUMyMi4yNTQ1IDEwLjQ0NDggMjUuMzIwOSAxMC40NjE0IDI1LjMyMDkgMTAuNDYxNEMzMi4yMzk2IDExLjIzNSAzNS4xOTM5IDE0LjYyOTIgMzUuMTkzOSAxNC42MjkyQzQwLjE1OTMgMTkuOTg1NCA0NC42Njk0IDE5LjkzNTIgNDQuNjY5NCAxOS45MzUyQzQzLjA0OTEgMjEuNDg0NSAzNy4xNzMyIDIxLjAxODIgMzcuMTczMiAyMS4wMTgyWk05Ljc1MDkgOS42NzA4N0M5Ljc1MTM5IDkuNjY5MTQgOS43NTE5OCA5LjY2NzQzIDkuNzUyNjUgOS42NjU3Nkw5Ljc1MDkgOS42NzA4N1oiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl8wXzEpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNDQuNzUzOSAxOS45MzZDNDQuNzUzOSAxOS45MzYgNDQuMDUwMSAyMy44MzI0IDQwLjM1ODUgMjQuMjg2OEM0MC4zNTg1IDI0LjI4NjggMjYuOTczIDI0LjIwMDUgMjUuOTk3MSAzNi4zNjAzTDI1Ljc3MDMgMzkuNzc2M0w5LjcxMjE2IDM1LjA5NjJDOS43MTIxNiAzNS4wOTYyIDExLjIyNjUgMjkuOTMzMiAxNC41MzU3IDI1Ljc4OEMxNC41MzU3IDI1Ljc4OCAyMC4xNTY0IDE3Ljg0NzUgMzYuMTczOSAxOS45Mzk4QzM2LjE3MzkgMTkuOTM5OCAzOC4wNDQ0IDIwLjMxNjUgNDAuNjY5IDIwLjU2MjNDNDIuODg2OCAyMC43Njk5IDQ0Ljc1MzkgMTkuOTM2IDQ0Ljc1MzkgMTkuOTM2WiIgZmlsbD0idXJsKCNwYWludDRfbGluZWFyXzBfMSkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNS42NDY1IDE4LjA4MjlDMzUuNjQ2NSAxOC4wODI5IDMyLjE2OTEgMTYuMjc0MiAyNy44NDQgMTYuNDQ0OUMyNy44NDQgMTYuNDQ0OSAzMC4xOTY1IDE0LjYwNjYgMzMuMzc2IDE1LjA1NTdMMzUuNjQ2NSAxOC4wODI5WiIgZmlsbD0iIzcyMkIwMCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTI2Ljg1NTkgMzQuNjkzN0MyNi44NTU5IDM0LjY5MzcgMjcuOTg2NSAzNS40NzQyIDI5Ljc4MjUgMzUuMDU5NkMyOS43ODI1IDM1LjA1OTYgMjYuODgxIDM2Ljc0MTggMjAuNzY1NyAzNC40MzU0QzIwLjc2NTcgMzQuNDM1NCAxNC40NTg3IDMxLjYxNDMgMTAuMDIyMyAzMi4yNTc2QzcuMTcwNzggMzIuNjcxIDQuNjQ5MzUgMzQuOTM2NSAzLjEyMjQxIDM2LjY2MTNDMS4yNzc1MyAzOC43NDUyIDEuNTA3MTggMzcuNzcxIDYuMTQwMyAzNy4xOTc2QzcuMjU0MDYgMzcuMDU5OCA2LjYxMjY1IDM3LjM3NjUgNi42MTI2NSAzNy4zNzY1QzYuNjEyNjUgMzcuMzc2NSAwLjQyMjcxMiAzOS45NjkzIDAuMDA0NDI1MzEgNDIuMjc1NUMtMC4xMDAwMjEgNDIuODUxMiAxLjYzNDk3IDQxLjIyNjQgNi4yMTAxOCA0MS4zNzA0QzExLjgyNjcgNDEuNTQ3MyAxNi43MTM0IDQ0LjgwOSAxOC43MjI4IDQ1LjM0NjdDMjIuODM2MiA0Ni40NDcyIDI4LjczNjQgNDYuNjk4NCAzNC4xNDg3IDQyLjQ1NEMzNC4xNDg3IDQyLjQ1NCAzOS4xNDMzIDM5LjMyMDMgNDAuNjg3NCAzMy41Mjk4QzQxLjA4OTIgMzEuOTIzMyA0MS4zMjU5IDMwLjI4IDQxLjM5MzggMjguNjI1NUM0MS40NzU4IDI2LjQ2OTQgNDAuODE5NyAyNC4xOTk1IDQwLjgxOTcgMjQuMTk5NUM0MC44MTk3IDI0LjE5OTUgMzcuMTY5OSAzMi4yODQ2IDI2Ljg1NTkgMzQuNjkzN1oiIGZpbGw9InVybCgjcGFpbnQ1X2xpbmVhcl8wXzEpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMjIuNzIyIiB5MT0iMTcuMjQyNCIgeDI9IjIzLjQyMDciIHkyPSIzNC41ODA5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNEQURCNDgiLz4KPHN0b3Agb2Zmc2V0PSIwLjY1NjI1IiBzdG9wLWNvbG9yPSIjNjM3NjIxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8wXzEiIHgxPSIyMy40MzM0IiB5MT0iOS4xNjYyMSIgeDI9IjE0LjkzODgiIHkyPSI5LjE2NjIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNFQzZGMDEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjRCMjNEIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8wXzEiIHgxPSIyNC4xNDQ4IiB5MT0iOS41NDI4MyIgeDI9IjIzLjY0MjYiIHkyPSIxLjM0MTEzIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGNEIzM0UiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkI2RjFCIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8wXzEiIHgxPSIxMC41ODY4IiB5MT0iOS41ODQ2OCIgeDI9IjQwLjQ2NDQiIHkyPSIyMS4zODUxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGQjZEMUEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjNCMjNFIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQ0X2xpbmVhcl8wXzEiIHgxPSIxMy43MjUyIiB5MT0iMzMuNDM2NiIgeDI9IjQyLjA5NjQiIHkyPSIyMC45NjY3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGM0I2M0YiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkI3MDFDIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQ1X2xpbmVhcl8wXzEiIHgxPSIxMi43MjEiIHkxPSI0Ni4wMzE5IiB4Mj0iMzcuMjg0MyIgeTI9IjMwLjcxNjUiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0VDNkYwMCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGNEIzM0UiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K";
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
      "sui:signTransaction": {
          version: "2.0.0",
          signTransaction: this.signTransaction.bind(this),
      },
      "sui:signAndExecuteTransaction": {
          version: "2.0.0",
          signAndExecuteTransaction: this.signAndExecuteTransaction.bind(this),
      },
      "suiWallet:stake": {
          version: "0.0.1",
          stake: this.stake.bind(this),
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
      await this.send("acquirePermissions", [
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

  async signTransaction(tx) {
    return this.send("signTransaction", tx);
  }

  async signAndExecuteTransaction(input) {
    return this.send("executeTransaction", {
      type: "v2",
      data: input.transaction,
      options: input.options,
    });
  }

  async stake (input) {
    return this.send({
        type: "stake",
        validatorAddress: input.validatorAddress,
    });
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