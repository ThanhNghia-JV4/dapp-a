const Dappatoken = artifacts.require("Dappatoken")
const Redapptoken = artifacts.require("Redapptoken")
const Farm = artifacts.require("Farm")

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n) {
	return web3.utils.toWei(n, 'ether')
}

contract('Farm', ([owner, investor]) => {
	let redappToken, dappToken, tokenFarm

	before(async () => {
		// load Contrats
		redappToken = await Redapptoken.new()
		dappToken = await Dappatoken.new()
		tokenFarm = await Farm.new(dappToken.address, redappToken.address)

		// Transfer all Dapp tokens to farm (1million)
		await dappToken.transfer(tokenFarm.address, tokens('1000000'))

		// Send tokens to investor
		await redappToken.transfer(investor, tokens('100'), { from: owner })
	})

	describe('Re deployment', async () => {
		it('has a name', async () => {			
			const name = await redappToken.name()
			assert.equal(name, 'Re Token')
		})
	})

	describe('DAPP deployment', async () => {
		it('has a name', async () => {			
			const name = await dappToken.name()
			assert.equal(name, 'Dappa Token')
		})
	})

	describe('Farm deployment', async () => {
		it('has a name', async () => {			
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm')
		})
	})

	it('contract has tokens', async () => {
		let balance = await dappToken.balanceOf(tokenFarm.address)
		assert.equal(balance.toString(), tokens('1000000'))
	})

	describe('Farming tokens', async () => {
		it('rewards investors for staking mDai tokens', async() => {
			let result

			// check investor balance before staking
			result = await redappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

			// stake Mock DAI Tokens
			await redappToken.approve(tokenFarm.address, tokens('100'), { from: investor })
			await tokenFarm.stakeTokens(tokens('100'), { from: investor })

			// check staking result
			result = await redappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct before staking')

			result = await redappToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance is correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

			// issue tokens
			await tokenFarm.issueTokens({ from: owner })

			// check balances after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct after issuance')

			// ensure that only owner can issue tokens
			await tokenFarm.issueTokens({ from: investor}).should.be.rejected;

			// unstake tokens
			await tokenFarm.unstakeTokens({ from: investor });

			// check results after unstaking
			result = await redappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

			result = await redappToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
		})
	})	
})