import { Allowlist } from "../../build/typechain/Allowlist"
import AllowlistArtifact from "../../build/artifacts/contracts/Allowlist.sol/Allowlist.json"
import { BigNumber } from "@ethersproject/bignumber"
import { MathUtils } from "../../build/typechain/MathUtils"
import MathUtilsArtifact from "../../build/artifacts/contracts/MathUtils.sol/MathUtils.json"
import { Swap } from "../../build/typechain/Swap"
import SwapArtifact from "../../build/artifacts/contracts/Swap.sol/Swap.json"
import { SwapUtils } from "../../build/typechain/SwapUtils"
import SwapUtilsArtifact from "../../build/artifacts/contracts/SwapUtils.sol/SwapUtils.json"
import { deployContract } from "ethereum-waffle"
import { deployContractWithLibraries } from "../../test/testUtils"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import { GenericERC20 } from "../../build/typechain/GenericERC20"
import GenericERC20Artifact from "../../build/artifacts/contracts/helper/GenericERC20.sol/GenericERC20.json"


// Swap.sol constructor parameter values
const TOKEN_ADDRESSES = [
  "0xfc8b2690f66b46fec8b3ceeb95ff4ac35a0054bc", // Dai token on xDai (BSC) - 18 decimals
  "0xd10cc63531a514bba7789682e487add1f15a51e2", // USDC on XDAI (BSC) - 18 decimals
  "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83", // USDC - 6 decimals
  "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d", // WXDai - 18 decimals
]
const INITIAL_A_VALUE = 200
const SWAP_FEE = 4e6 // 0.004%
const ADMIN_FEE = 10e8 //10% of the swap fee
const WITHDRAW_FEE = 0
const BTC_LP_TOKEN_NAME = "rocky LP - primoUSD"
const BTC_LP_TOKEN_SYMBOL = "rUSDp"


// To run this script and deploy the contracts on the mainnet:
//    npx hardhat run deployment/onchain/swap-mainnet.ts --network mainnet
//
// To verify the source code on etherscan:
//    npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS [arg0, arg1, ...]
//    or
//    npx hardhat sourcify --network xdai

async function deploySwap(): Promise<void> {
  
  const [deployer]: SignerWithAddress[] = await ethers.getSigners()
  console.log(`Deploying with ${deployer.address}`)
  

  // Tokens
    const daiToken = (await deployContract(
    deployer,
    GenericERC20Artifact,
    ["WXDai", "WXDAI", "18"],
  )) as GenericERC20
  await daiToken.deployed()

  const usdcToken = (await deployContract(
    deployer,
    GenericERC20Artifact,
    ["USDC Coin", "USDC", "6"],
  )) as GenericERC20
  await usdcToken.deployed()

  const bscDAI = (await deployContract(
    deployer,
    GenericERC20Artifact,
    ["BSC Dai", "bscDAI", "18"],
  )) as GenericERC20
  await bscDAI.deployed()

  const bscUSDC = (await deployContract(
    deployer,
    GenericERC20Artifact,
    ["bscUSD", "bscUSDC", "18"],
  )) as GenericERC20
  await bscUSDC.deployed()

 
  // Deploy Allowlist
  // Estimated deployment cost = 0.00081804 * gwei
  const allowlist = (await deployContract(
    deployer,
    AllowlistArtifact,
    // ["0xca0f8c7ee1addcc5fce6a7c989ba3f210db065c36c276b71b8c8253a339318a3"], // test merkle root https://github.com/saddle-finance/saddle-test-addresses
    ["0xc799ec3a26ef7b4c295f6f02d1e6f65c35cef24447ff343076060bfc0eafb24e"], // production merkle root
  )) as Allowlist
  await allowlist.deployed()
  console.log(`Allowlist address: ${allowlist.address}`)

  // Deploy MathUtils
  const mathUtils = (await deployContract(
    deployer,
    MathUtilsArtifact,
  )) as MathUtils
  await mathUtils.deployed()
  console.log(`mathUtils address: ${mathUtils.address}`)

  // Deploy SwapUtils with MathUtils library
  const swapUtils = (await deployContractWithLibraries(
    deployer,
    SwapUtilsArtifact,
    {
      MathUtils: mathUtils.address,
    },
  )) as SwapUtils
  await swapUtils.deployed()
  console.log(`swapUtils address: ${swapUtils.address}`)

  // Deploy Swap with SwapUtils library
  const swapConstructorArgs = [
    [
        daiToken.address,
        usdcToken.address,
        bscDAI.address,
        bscUSDC.address,
    ],
    [18, 6, 18, 18],
    BTC_LP_TOKEN_NAME,
    BTC_LP_TOKEN_SYMBOL,
    INITIAL_A_VALUE,
    SWAP_FEE,
    ADMIN_FEE,
    WITHDRAW_FEE,
    allowlist.address,
  ]

  console.log(swapConstructorArgs)

  // Deploy BTC swap
  // Estimated deployment cost = 0.004333332 * gwei
  const btcSwap = (await deployContractWithLibraries(
    deployer,
    SwapArtifact,
    { SwapUtils: swapUtils.address },
    swapConstructorArgs,
  )) as Swap
  await btcSwap.deployed()

  // Set limits for deposits
  // Total supply limit = 150 BTC
  await allowlist.setPoolCap(
    btcSwap.address,
    BigNumber.from(10).pow(18).mul(150),
  )
  // Individual deposit limit = 1 BTC
  await allowlist.setPoolAccountLimit(
    btcSwap.address,
    BigNumber.from(10).pow(18),
  )

  await btcSwap.deployed()
  const btcLpToken = (await btcSwap.swapStorage()).lpToken

  console.log(`Tokenized BTC swap address: ${btcSwap.address}`)
  console.log(`Tokenized BTC swap token address: ${btcLpToken}`)
}

deploySwap().then(() => {
  console.log("Successfully deployed contracts to on-chain network...")
})
