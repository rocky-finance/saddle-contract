import { BigNumber } from "@ethersproject/bignumber"
import { RockyMasterChef } from "../../build/typechain/RockyMasterChef"
import RockyMasterChefArtifact from "../../build/artifacts/contracts/RockyMasterChef.sol/RockyMasterChef.json"
import { RockyToken } from "../../build/typechain/RockyToken"
import RockyTokenArtifact from "../../build/artifacts/contracts/RockyToken.sol/RockyToken.json"

import { deployContract } from "ethereum-waffle"
import { deployContractWithLibraries } from "../../test/testUtils"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import { GenericERC20 } from "../../build/typechain/GenericERC20"
import GenericERC20Artifact from "../../build/artifacts/contracts/helper/GenericERC20.sol/GenericERC20.json"


// Swap.sol constructor parameter values
const _rockyPerBlock = 1000000000000000;
const _startBlock = 9799045; // https://ropsten.etherscan.io/block/countdown/9799045


// To run this script and deploy the contracts on the mainnet:
//   npx hardhat run deployment/onchain/rocky-ropsten.ts --network ropsten
//
// To verify the source code on etherscan:
//    npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS [arg0, arg1, ...]
//    or
//    npx hardhat sourcify --network xdai

async function deployRocky(): Promise<void> {
  
  const [deployer]: SignerWithAddress[] = await ethers.getSigners()
  console.log(`Deploying with ${deployer.address}`)
 
  // Deploy RockyToken
  const rockyToken = (await deployContract(
    deployer,
    RockyTokenArtifact
    )) as RockyToken
  await rockyToken.deployed()
  console.log(`Rocky token address: ${rockyToken.address}`)

  // Deploy masterchef
  const masterChef = (await deployContract(
    deployer,
    RockyMasterChefArtifact,
    [rockyToken.address,
    _rockyPerBlock,
    _startBlock]
  )) as RockyMasterChef
  await masterChef.deployed()
  console.log(`Rocky masterchef address: ${masterChef.address}`)

}

deployRocky().then(() => {
  console.log("Successfully deployed contracts to on-chain network...")
})
