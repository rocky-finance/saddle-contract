# rocky-contract

## Deployment
- [Rocky token: 0xfe96D2aF9431FF7b3cC451C5fFa171bd5f3f3E66](https://blockscout.com/poa/xdai/address/0xfe96D2aF9431FF7b3cC451C5fFa171bd5f3f3E66)

## Installation

```bash
$ npm i
```

## Usage

### Build

```bash
$ npm run build
```

### Test

```bash
$ npm test
```

### Coverage

```bash
$ npm run coverage
```

### Deploying contracts to localhost Hardhat EVM

```bash
$ npx hardhat node
$ npx hardhat run --network localhost deployment/hardhat/swap.ts
```

`deployment/hardhat/swap-forkMainnet.ts` is also available for forking the mainnet contracts into the hardhat network.

You can connect to this RPC server via `localhost:8545`.

### Generating GitBook docs

```bash
$ npx solidity-docgen --templates=templates
```

The output in the `docs` folder should be copied to the appropriate folder in the [saddle-docs repo](https://github.com/saddle-finance/saddle-docs/tree/master/solidity-docs).

### Running Slither

[Slither](https://github.com/crytic/slither) is a Solidity static analysis framework. To run it locally:

```bash
$ pip3 install slither-analyzer
$ slither .
```

Slither is configured to run as a GitHub Action and error on any high findings.
