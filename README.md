# Conjure
[![Twitter Follow](https://img.shields.io/twitter/follow/ConjureFi?label=Conjure.Finance&style=social)](https://twitter.com/ConjureFi/)
CURRENTLY IN ALPHA - USE AT OWN CAUTION

Permissionless, flexible and robust framework for Oracle deployment with multifeed support, subscriptions and instant deployment.

## What is Open Oracle Framework (OOF)?

Open Oracle Framework’s a framework for permissionless oracle deployment and robust and flexible on-chain oracle feeds. Oracles are simply multi-party median value feeds, but you can even implement your own price logic through a dedicated proxy owner, which itself has it’s own price logic. The median value model takes the value for n signers, uses the median value submitted, makes sure that m signers for the m/n threshold has been met and returns the value. The oracle can require a small fee for subscriptions to feeds to cover gas fees, and are able to provide many feeds from 1 contract, allowing for highly efficient feed submission and retrieval. Oracles can set at the feed level if feeds are public, per feed subscription based (with unique pricing) or subscription pass based, allowing for adaptive models for revenue and use cases.

## Creating an Oracle and Feeds

### Step 1. Go to the factory at 
https://polygonscan.com/address/0x00f0fEED50926c27261dF37f7bCcC519d87525D0#writeContract
https://etherscan.com/address/0x00f0fEED50926c27261dF37f7bCcC519d87525D0#writeContract

### 2. Call oofMint
signers_ (address[]) - The singners for the oracle, these are responsible for feed updates, proposals and contract updates and earn fees

signerThreshold_ (uint256) - The minimum signers needed to submit a feed and takes the medium value submitted to authenticate a feed to update

payoutAddress_ (address) - Can be 0x0, in which case the fees will be split accross all signers or can be a set address to take all feeds, usable for cold wallets or gnosis/other contracts to handle the fees

subscriptionPassPrice_ (uint256) - The price to purchase a subscription for 28 days to all oracle feeds

### 3. https://github.com/ConjureFi/OOFNode to setup the node

### 4. You're all done, you're now providing onchain feeds using your own custom oracle!

# License
#SCRY1
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The Software is not used for in-production level systems and only in test environments. Where the system is in production (used on the network/s in a non-testnet/testing capacity, live on a mainnet or for commercial use) the person or parties MUST have a valid license issued through the NFT licensing system.

The Scry Protocol NFT DAO reserves the right to remove this license and fully open-source all software under the MIT or other licenses as needed.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


