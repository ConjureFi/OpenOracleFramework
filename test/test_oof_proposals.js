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
describe("OOF Proposal Tests", function () {

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
        2,
        owner.address,
        "1000000000000000000"
    );

    const {events, cumulativeGasUsed, gasUsed} = await tx.wait();
    const [event] = events.filter(e => e.event === "NewOOF");
    oof = await ethers.getContractAt("OpenOracleFramework", event.args.oof);
  });

  it("Create and Test update price pass proposal", async function () {

    // only a signer can do this
    await expect(oof.connect(addr4).createProposal("2000000000000000000", zeroaddress, 0, 0)).to.be.revertedWith("Only a signer can perform this action")

    // create propsal for new feed pass price
    await oof.createProposal("2000000000000000000", zeroaddress, 0, 0);

    let prop = await oof.proposalList(0)
    expect(prop.uintValue).to.be.equal("2000000000000000000")

    let passcost = await oof.subscriptionPassPrice()
    expect(passcost).to.be.equal("1000000000000000000");

    // should not be possible only by signer
    await expect(oof.connect(addr4).signProposal(0)).to.be.revertedWith("Only a signer can perform this action")

    //sign
    await oof.connect(addr1).signProposal(0);

    passcost = await oof.subscriptionPassPrice()
    expect(prop.uintValue).to.be.equal("2000000000000000000")

    // cant sign non active proposal
    await expect(oof.connect(addr1).signProposal(0)).to.be.revertedWith("Proposal not active")
  });

  it("Create and Test update the threshold", async function () {

    // create proposal for new feed pass price
    await oof.createProposal(0, zeroaddress, 1, 0);

    let prop = await oof.proposalList(1)
    expect(prop.uintValue).to.be.equal(0)

    let signerThreshold = await oof.signerThreshold()
    expect(signerThreshold).to.be.equal(2);

    //sign
    await expect(oof.connect(addr1).signProposal(1)).to.be.revertedWith("Threshold cant be 0");

    // create proposal for new feed pass price with too less signers
    await oof.createProposal(4, zeroaddress, 1, 0);

    prop = await oof.proposalList(2)
    expect(prop.uintValue).to.be.equal(4)

    //sign
    await expect(oof.connect(addr1).signProposal(2)).to.be.revertedWith("Threshold cant be bigger then length of signers");

    // create proposal for new feed pass price with ok values
    await oof.createProposal(1, zeroaddress, 1, 0);

    prop = await oof.proposalList(3)
    expect(prop.uintValue).to.be.equal(1)

    //sign
    await oof.connect(addr1).signProposal(3);

    signerThreshold = await oof.signerThreshold()
    expect(signerThreshold).to.be.equal(1)

    // cant sign non active proposal
    await expect(oof.connect(addr1).signProposal(3)).to.be.revertedWith("Proposal not active")
  });

  it("Create and Test add signer", async function () {

    // create proposal for new feed pass price
    await oof.createProposal(0, addr1.address, 2, 0);

    let prop = await oof.proposalList(4)
    expect(prop.addressValue).to.be.equal(addr1.address)

    //sign
    await expect(oof.connect(addr1).signProposal(4)).to.be.revertedWith("Signer already exists");

    // create proposal for new feed pass price with too less signers
    await oof.createProposal(0, addr4.address, 2, 0);

    prop = await oof.proposalList(5)
    expect(prop.addressValue).to.be.equal(addr4.address)

    //sign
    await oof.connect(addr1).signProposal(5);

    let signerLength = await oof.signerLength()
    expect(signerLength).to.be.equal(4)

    let isSigner = await oof.signers(3)

    expect(isSigner).to.be.equal(addr4.address)
  });

  it("Create and Test remove signer", async function () {

    // increase threshold to 4
    await oof.createProposal(4, addr1.address, 1, 0);

    //sign
    await oof.connect(addr1).signProposal(6);

    // try to remove a signer
    await oof.createProposal(0, addr1.address, 3, 0);

    await oof.connect(addr1).signProposal(7)
    await oof.connect(addr2).signProposal(7)

    await expect(oof.connect(addr4).signProposal(7)).to.be.revertedWith("Less signers than threshold")

    // get threshold to 1
    await oof.createProposal(1, addr1.address, 1, 0);

    //sign
    await oof.connect(addr1).signProposal(8);
    await oof.connect(addr2).signProposal(8);
    await oof.connect(addr4).signProposal(8)

    // try to remove a non signer
    await oof.createProposal(0, addr3.address, 3, 0);



    await expect(oof.connect(addr4).signProposal(9)).to.be.revertedWith("Address to remove has to be a signer")

    //get len before
    let lenbefore = await oof.signerLength()

    // try to remove a signer
    await oof.createProposal(0, addr2.address, 3, 0);
    await oof.connect(addr4).signProposal(10)

    //get len after
    let lenafter = await oof.signerLength()

    expect(lenafter).to.be.equal(lenbefore-1)
  });

  it("Create and Test new payout address", async function () {

    await oof.createProposal(0, addr1.address, 4, 0);

    let payoutAddress = await oof.payoutAddress()
    expect(payoutAddress).to.be.equal(owner.address)

    //sign
    await oof.connect(addr1).signProposal(11);

    payoutAddress = await oof.payoutAddress()
    expect(payoutAddress).to.be.equal(addr1.address)
  });

  it("Create and Test for revenue mode", async function () {

    // create proposal for new rev mode
    await oof.createProposal(2, zeroaddress, 5, 0);

    //sign
    await expect(oof.connect(addr1).signProposal(12)).to.be.revertedWith("Invalid argument for revenue Mode");

    // create proposal for new rev mode
    await oof.createProposal(0, zeroaddress, 5, 0);

    //sign
    await expect(oof.connect(addr1).signProposal(13)).to.be.reverted

    // create feeds
    await oof.createNewFeeds(
        ["feed1", "feed2"],
        ["test1", "test2"],
        [18,0],
        [3600, 10800],
        ["100000000000000", "100000000000000"],
        [1,0]);


    let revmode = await oof.getFeedList([0])
    expect(revmode[3][0]).to.be.equal(1)

    // create proposal for new rev mode
    await oof.createProposal(0, zeroaddress, 5, 0);

    //sign
    await oof.connect(addr1).signProposal(14);

    revmode = await oof.getFeedList([0])
    expect(revmode[3][0]).to.be.equal(0)
  });

  it("Create and Test for feed cost", async function () {

    // create proposal for new feed cost
    await oof.createProposal(0, zeroaddress, 6, 0);

    //sign
    await expect(oof.connect(addr1).signProposal(15)).to.be.revertedWith("Feed price cant be 0");

    // create proposal for new feed cost
    await oof.createProposal("500000000000000", zeroaddress, 6, 0);

    let feedCost = await oof.getFeedList([0])
    expect(feedCost[4][0]).to.be.equal("100000000000000")

    //sign
    await oof.connect(addr1).signProposal(16);

    feedCost = await oof.getFeedList([0])
    expect(feedCost[4][0]).to.be.equal("500000000000000")
  });
});
