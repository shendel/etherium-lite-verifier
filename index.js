const solc = require('solc')
const Web3 = require('web3')
const fs = require('fs')

const provider = 'http://192.168.56.200:8545/'

let contract_address = '0x43bD62B5918902eC846Ce758DeA7df76fec3Ed41'
let version = 'v0.8.12+commit.f00d7308'
//
// 0.4.18 test
/*
  ContractA: 0xAD2620F01A9f010537A2F44862b966d6CC012564
  ContractB: 0xa06105Ff6Ba0740531AAe2f62b38e095C8a587BB
*/
/*
let contract_address = '0xAD2620F01A9f010537A2F44862b966d6CC012564'

let version = 'v0.4.18+commit.9cf6e910'
*/


//
// 0.8.12 test
/*
  ContractA: 0x2Eabe0f809370ae015E1943f7a5EAff7Eb9dBdEA
  ContractB: 0x43bD62B5918902eC846Ce758DeA7df76fec3Ed41
*/

contract_address = '0x43bD62B5918902eC846Ce758DeA7df76fec3Ed41'
version = 'v0.8.12+commit.f00d7308'

//
// Multical verify test
// 0.8.12
// 0x5E4e74f8Ac59d00941d41953D036fe2C8d511477

contract_address = '0x5E4e74f8Ac59d00941d41953D036fe2C8d511477'
version = 'v0.8.12+commit.f00d7308'

const optimization = true
const optimization_runs = 200
const evmVersion = undefined // 'istanbul'

const web3 = new Web3( new Web3.providers.HttpProvider(provider))

//const source = input = fs.readFileSync('./test.sol','utf8')
const source = input = fs.readFileSync('./mc.sol','utf8')

const solc_input = {
  language: "Solidity",
  sources: {
    file: { "content": source }
  },
  settings: {
    optimizer: {
      enabled: optimization,
      runs: optimization_runs,
    },
    evmVersion: evmVersion,
    outputSelection: {
      "*": {
        "*": [ "*" ]
      }
    }
  }
}

solc.loadRemoteVersion(version, function(err, solc_specific) {
  if (solc_specific) {
    console.log('>>> Compile')
    const solc_output = solc_specific.compile(JSON.stringify(solc_input))
    const json_output = JSON.parse(solc_output)
    console.log(json_output)
    const contracts = {}
    Object.keys(json_output.contracts.file).forEach((name) => {
      contracts[name] = {
        abi: json_output.contracts.file[name].abi,
        bytecode: json_output.contracts.file[name].evm.deployedBytecode.object
      }
    })
    console.log(contracts)
    web3.eth.getCode(contract_address).then((bytecode) => {
      const endCode_0_4 =        'a165627a7a72305820'
      const endCode_0_18 = 'fea2646970667358221220'
      console.log('>>> bytecode on rpc')
      console.log(bytecode)
      const rpc_ending_point_0_4 = bytecode.search(endCode_0_4) !== -1 ? bytecode.search(endCode_0_4) : false
      const rpc_ending_point_0_18 = bytecode.search(endCode_0_18) !== -1 ? bytecode.search(endCode_0_18) : false
      const rpc_ending_point = rpc_ending_point_0_4 || rpc_ending_point_0_18
      
      console.log('>>> rpc_ending_point', rpc_ending_point)
      const rpc_formated = bytecode.slice(2,rpc_ending_point)
      console.log('>>> rpc formated')
      console.log(rpc_formated)
      console.log('--------------------------------------------')
      let founded = false
      Object.keys(contracts).forEach((name) => {
        console.log('>>> ', name)
        console.log(contracts[name].bytecode)
        const ending_point_0_4 = contracts[name].bytecode.search(endCode_0_4) !== -1 ? contracts[name].bytecode.search(endCode_0_4) : false
        const ending_point_0_18 = contracts[name].bytecode.search(endCode_0_18) !== -1 ? contracts[name].bytecode.search(endCode_0_18) : false
        const ending_point = ending_point_0_4 || ending_point_0_18
        console.log('>>> ending_point', ending_point)
        const formatedCode = contracts[name].bytecode.slice(0, ending_point)
        console.log('>>>')
        console.log(formatedCode)
        if (rpc_formated == formatedCode) {
          console.log('>>>> Match', name)
          founded = name
        }
        console.log('--------------------------------------------')
      })
      console.log('>>> Founded', founded)
    }).catch((err) => {
      console.log('>>> err', err)
    })
  }
})