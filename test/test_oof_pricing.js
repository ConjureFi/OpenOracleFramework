// imports
const {expect} = require("chai");
const { ethers } = require("hardhat");
const {waffle} = require("hardhat");
const {deployContract, solidity} = waffle;
const provider = waffle.provider;
const zeroaddress = "0x0000000000000000000000000000000000000000";
const errorDelta = 1e-4;
const {BigNumber} = require('@ethersproject/bignumber');

function calcRelativeDiff(expected, actual) {
  const diff = BigNumber.from(expected).sub(actual).toNumber();
  return Math.abs(diff / expected);
}

// test suite for ConjureFactory
describe("OOF Pricing Tests", function () {

  // variable to store the deployed smart contract
  let oofImplementation;
  let oofFactory;
  let router;
  let oof;

  let owner, addr1, addr2, addr3, addr4;
  const deploy = async (name, ...args) => (await ethers.getContractFactory(name)).deploy(...args);

  // initial deployment of Conjure Factory
  before(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    oofImplementation = await deploy('OpenOracleFramework');

    // deploy router
    const ROUTER = await ethers.getContractFactory("ConjureRouter");

    router = await ROUTER.deploy(owner.address, owner.address);
    await router.deployed();

    // deploy alchemy factory
    oofFactory = await deploy(
        'OOFFactory',
        oofImplementation.address,
        router.address
    );
  })

  // basic mints
  it("Should be able to mint a new OOF Contract", async function () {
    const tx = await oofFactory.oofMint(
        [owner.address, addr1.address, addr2.address],
        3,
        owner.address,
        "1000000000000000000"
    );

    const {events, cumulativeGasUsed, gasUsed} = await tx.wait();
    const [event] = events.filter(e => e.event === "NewOOF");
    oof = await ethers.getContractAt("OpenOracleFramework", event.args.oof);
  });


  it("Should be able to create new feeds", async function () {

    await oof.createNewFeeds(
        ["feed1", "feed2", "feed3"],
        ["test1", "test2", "test3"],
        [18,18,18],
        [3600, 10800, 7200],
        ["1000000000000000", "2000000000000000", "1000000000000000"],
        [1,0,1]);

    let feedlist = await oof.getFeedList([0,1]);

    expect(feedlist[0][0]).to.be.equal("feed1");

    let feedlen = await oof.getFeedLength()
    expect(feedlen).to.be.equal("3")
  });

  it("Should be able to submit a feed", async function () {
    // send
    let overrides = {
      value: "1000000000000000000"
    };

    // buy pass for owner address
    await oof.buyPass(owner.address, 10800*5, overrides);

    let price = await oof.getFeeds([0,1,2]);

    expect(price[0][0]).to.be.equal(0)
    expect(price[0][1]).to.be.equal(0)
    expect(price[0][2]).to.be.equal(0)

    await oof.submitFeed(
        [0],
        [100]
    );

    await oof.submitFeed(
        [1],
        [200]
    );

    await oof.submitFeed(
        [2],
        [300]
    );

    price = await oof.getFeeds([0,1,2]);
    expect(price[0][0]).to.be.equal(0)
    expect(price[0][1]).to.be.equal(0)
    expect(price[0][2]).to.be.equal(0)

    await oof.connect(addr1).submitFeed(
        [0],
        [200]
    );

    await oof.connect(addr1).submitFeed(
        [1],
        [300]
    );

    price = await oof.getFeeds([0,1,2]);
    expect(price[0][0]).to.be.equal(0)
    expect(price[0][1]).to.be.equal(0)
    expect(price[0][2]).to.be.equal(0)

    // check historical price
    let block = await provider.getBlock(ethers.provider.blockNumber)

    let historic = await oof.getHistoricalFeeds([1],[block.timestamp])
    expect(historic[0]).to.be.equal(0)

    // submit again with addr1
    await oof.connect(addr1).submitFeed(
        [0],
        [200]
    );

    await oof.connect(addr2).submitFeed(
        [1],
        [400]
    );

    price = await oof.getFeeds([0,1,2]);
    expect(price[0][0]).to.be.equal(0)
    expect(price[0][1]).to.be.equal(300)
    expect(price[0][2]).to.be.equal(0)

    await ethers.provider.send("evm_increaseTime", [10800*2])
    await ethers.provider.send("evm_mine")      // mine the next block

    historic = await oof.getHistoricalFeeds([1],[block.timestamp])
    expect(historic[0]).to.be.equal(0)

    await oof.submitFeed(
        [1],
        [400]
    );

    await oof.connect(addr1).submitFeed(
        [1],
        [500]
    );

    await oof.connect(addr2).submitFeed(
        [1],
        [600]
    );

    historic = await oof.getHistoricalFeeds([1],[block.timestamp])
    expect(historic[0]).to.be.equal(300)

  });

  it("Should be able to check feed support", async function () {
    // send
    let overrides = {
      value: "1000000000000000000"
    };

    // mismatch
    await expect(oof.supportFeeds([0], [], overrides)).to.be.revertedWith("Length mismatch")

    // subscription mode turned on
    await expect(oof.supportFeeds([0], ["1000000000000000000"], overrides)).to.be.revertedWith("Subscription mode turned on")

    // wrong value
    await expect(oof.supportFeeds([1], ["1000000000000000001"], overrides)).to.be.revertedWith("Msg.value does not meet support values")


    // check support
    let support = await oof.feedSupport(1)
    expect(support).to.be.equal(0)

    await oof.supportFeeds([1], ["1000000000000000000"], overrides);

    support = await oof.feedSupport(1)
    expect(support).to.be.equal("1000000000000000000")
  })


});
