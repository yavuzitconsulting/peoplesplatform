import {HardhatUserConfig} from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import "@nomicfoundation/hardhat-toolbox";
require("@nomicfoundation/hardhat-chai-matchers");

const { GNOSIS_MNEMONIC } = process.env;

//console.log(process.env);
const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.10",
        settings: {
            optimizer: {
                enabled: true,
                // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
                runs: 200,
            },
            viaIR: true
        },
    },
    namedAccounts: {
        deployer: 0,
        receiver: 1,
    },
    defaultNetwork: "testnet",
    networks: {
        // View the networks that are pre-configured.
        // If the network you are looking for is not here you can add new network settings
        local_docker: {
            url: `http://172.17.0.2:8545`,
            gasPrice: 10000000000,
            gas: 25e8,
            blockGasLimit: 0x5ffffffffffffffff,
            allowUnlimitedContractSize: true,
        //accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80','0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'],
        },
        testnet: {
            url: "https://testnet.cryptng.xyz:8545",
            //gas:100000000000 ,
            blockGasLimit: 0x1fffffffffffff,
            allowUnlimitedContractSize: true,
            accounts: {
            mnemonic: 'balcony over chase second wrap hospital film tongue recycle credit staff parent',
            path: "m/44'/60'/0'/0",
            initialIndex: 0,
            count: 20,
            passphrase: "",
            },
        },
        gnosis: {
            url: "https://rpc.gnosischain.com",
            gasPrice: 5000000000,
            accounts: {
                mnemonic: `${GNOSIS_MNEMONIC}`,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
                passphrase: "",
            }
          },
        chiado: {
            url: "https://rpc.chiadochain.net",
            gasPrice: 1000000000,
            accounts: {
                mnemonic: 'balcony over chase second wrap hospital film tongue recycle credit staff parent',
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
                passphrase: "",
            }
        },
        scroll: {
            url: "https://sepolia-rpc.scroll.io/" || "",
            accounts: {
                mnemonic: 'balcony over chase second wrap hospital film tongue recycle credit staff parent',
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
                passphrase: "",
            }
        },
        neonlabs: {
            url: 'https://devnet.neonevm.org',
            accounts: {
                mnemonic: 'balcony over chase second wrap hospital film tongue recycle credit staff parent',
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
                passphrase: "",
            },
            network_id: 245022926,
            chainId: 245022926,
            allowUnlimitedContractSize: true,
            timeout: 1000000,
            isFork: true
          },
          'base-goerli': {
            url: 'https://goerli.base.org',
            accounts: {
                mnemonic: 'balcony over chase second wrap hospital film tongue recycle credit staff parent',
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
                passphrase: "",
            },
            gasPrice: 1000000000,
          }
    },
    etherscan: {
        apiKey: {
            scroll: 'VGT2V589VNFQ4CFKJKYR7VW8XPC3WIACCW',
            neonlabs: "test",
            chiado:"your key"
        },
        customChains: [
            {
                network: 'scroll',
                chainId: 534351,
                urls: {
                    apiURL: 'https://sepolia-blockscout.scroll.io/api',
                    browserURL: 'https://sepolia-blockscout.scroll.io/',
                },
            },
            {
                network: "neonlabs",
                chainId: 245022926,
                urls: {
                  apiURL: "https://devnet-api.neonscan.org/hardhat/verify",
                  browserURL: "https://devnet.neonscan.org"
                }
            },
            {
                network: "chiado",
                chainId: 10200,
                urls: {
                  apiURL: "https://blockscout.com/gnosis/chiado/api",
                  browserURL: "https://blockscout.com/gnosis/chiado",
                },
            },
        ],
    },
};
export default config;