import { providers, utils } from "ethers";
import * as fs from "fs";
import * as hre from "hardhat";
import * as readline from "readline-sync";


async function main() {
    // get the network name
    let network = hre.network.name == "hardhat"? "mainnet": hre.network.name;

    // read in address file and parse
    let rawdata = fs.readFileSync("addresses/"+network+".json").toString();
    let addressesFile = JSON.parse(rawdata);

    let safeList = [];
    let baseAssets = [];
    // get addresses for safelist
    for (const trancheListKey in addressesFile["tranches"]) {
        baseAssets.push(trancheListKey);
        const trancheList = addressesFile["tranches"][trancheListKey];
        for (const tranche of trancheList) {
            safeList.push(utils.getAddress(tranche.address))
            safeList.push(utils.getAddress(tranche.ptPool.address))
            safeList.push(utils.getAddress(tranche.ytPool.address))
        }
    }

    let chainid = providers.getNetwork(network).chainId;

    let addresses: any = {}
    // add the rest of the known address types
    addresses = {
        balancerVaultAddress: utils.getAddress(addressesFile["balancerVault"]),
        convergentPoolFactoryAddress: utils.getAddress(addressesFile["convergentCurvePoolFactory"]),
        trancheFactoryAddress: utils.getAddress(addressesFile["trancheFactory"]),
        userProxyContractAddress: utils.getAddress(addressesFile["userProxy"]),
        weightedPoolFactoryAddress: utils.getAddress(addressesFile["weightedPoolFactory"]),
    }

    // add base asset tokens
    for (const baseAsset of baseAssets) {
        const keyName = baseAsset+"Address"
        addresses[keyName]=utils.getAddress(addressesFile["tokens"][baseAsset])
    }

    // Add base assets that exist in the network that was NOT selected to the json

    // get NOT the network name
    let notNetwork = network == "mainnet"? "goerli": "mainnet";
    // read in address file and parse
    let notNetworkRawdata = fs.readFileSync("addresses/"+notNetwork+".json").toString();
    let notNetworkAddressesFile = JSON.parse(notNetworkRawdata);
    let notNetworkBaseAssets = [];
    // store base assets listed in NOT network json
    for (const trancheListKey in notNetworkAddressesFile["tranches"]) {
        notNetworkBaseAssets.push(trancheListKey);
    }

    // add base asset tokens that are NOT already added
    for (const notNetworkBaseAsset of notNetworkBaseAssets) {
        const keyName = notNetworkBaseAsset+"Address"
        if (!addresses.hasOwnProperty(keyName)){
            addresses[keyName]="0x0000000000000000000000000000000000000000";
        }
    }

    // frontend json structure
    let frontend = {
        addresses: addresses,
        chainId: chainid,
        safelist: safeList
    };

    let frontendJson = JSON.stringify(frontend, null, 4);
    console.log(frontendJson);
    fs.writeFileSync('addresses/frontend-'+network+'.addresses.json', frontendJson,'utf8');

    if(process.env["WRITE_CHANGELOG"]=="1"){
        // get release version
        const releaseVersion = readline.question("Release Version (e.g. vX.X.X:X): ");
        fs.mkdirSync("changelog/releases/"+network+"/"+releaseVersion, { recursive: true })
        fs.copyFileSync("addresses/"+network+".json","changelog/releases/"+network+"/"+releaseVersion+"/addresses.json")
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
