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
describe("OOF Basic Tests", function () {

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
        [owner.address],
        1,
        owner.address,
        "1000000000000000000"
    );

    const {events, cumulativeGasUsed, gasUsed} = await tx.wait();
    const [event] = events.filter(e => e.event === "NewOOF");
    oof = await ethers.getContractAt("OpenOracleFramework", event.args.oof);
  });

  it("Check if all values of the OOF contract have been deployed and set right", async function () {
    let signerThreshold = await oof.signerThreshold();
    let signers = await oof.signers(0);
    let signerLength = await oof.signerLength();
    let payoutAddress = await oof.payoutAddress();
    let subscriptionPassPrice = await oof.subscriptionPassPrice();

    expect(signerThreshold).to.equal("1");
    expect(signers).to.equal(owner.address);
    expect(signerLength).to.equal("1");
    expect(payoutAddress).to.equal(owner.address);
    expect(subscriptionPassPrice).to.equal("1000000000000000000");
  });

  it("Should revert if submitFeed is called by a non signer address", async function () {
    await expect(oof.connect(addr1).submitFeed([0],[0])).to.be.revertedWith("Only a signer can perform this action");
  });

  it("Should be able to create a new feed", async function () {

    await oof.createNewFeeds(
        ["feed1", "feed2"],
        ["test1", "test2"],
        [18,0],
        [3600, 10800],
        ["100000000000000", "100000000000000"],
        [1,0]);

    let feedlist = await oof.getFeedList([0,1]);

    expect(feedlist[0][0]).to.be.equal("feed1");
  });

  it("Should be able to submit a feed", async function () {

    await oof.submitFeed(
        [100],
        [0]
    );
  });

  it("Check feed visibility", async function () {

    // should not be possible
    await expect(oof.connect(addr1).getFeeds([0])).to.be.revertedWith("No subscription to feed");

    // send
    let overrides = {
      value: "1000000000000000000"
    };

    // buy pass
    await oof.connect(addr1).buyPass(addr1.address, 3600, overrides);

    let price = await oof.connect(addr1).getFeeds([0]);
    console.log(price)
  });


});
