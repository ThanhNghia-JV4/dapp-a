const Dappatoken = artifacts.require("Dappatoken")
const Redapptoken = artifacts.require("Redapptoken")
const Farm = artifacts.require("TokenFarm")
//, network, accounts for function
module.exports = async function(deployer, network, accounts) {
	// Deploy Re
	await deployer.deploy(Redapptoken) 
	const reToken = await Redapptoken.deployed()

	// Deploy Dapp Token
	await deployer.deploy(Dappatoken) 
	const dappToken = await Dappatoken.deployed()

	// Deploy Farm
	await deployer.deploy(Farm, dappToken.address, reToken.address) //
	const tokenFarm = await Farm.deployed()

	// Transfer all tokens to TokenFarm (1 million)
	await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

	// Transfer 100 Mock DAI tokens to investor
	await reToken.transfer(accounts[1], '100000000000000000000')

}
// const Redapptoken = artifacts.require("Redapptoken");

// module.exports = function(deployer){
//     deployer.deploy(Redapptoken);
// }; 