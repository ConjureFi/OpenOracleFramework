// imports
const {expect} = require("chai");
const {ethers} = require("hardhat");
const zeroaddress = "0x0000000000000000000000000000000000000000";

// test suite for OOF
describe("Test OOF Factory Deploy Functions (Gas)", function () {

    // variable to store the deployed smart contract
    let oofImplementation;
    let oofFactory;
    let mock;

    let owner, addr1, addr2, addr3, addr4;
    const deploy = async (name, ...args) => (await ethers.getContractFactory(name)).deploy(...args);

    it('CloneLibrary works', async () => {
        const test = await deploy('TestClone');
        await test.deployed();
    })

    // initial deployment of Conjure Factory
    before(async function () {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        oofImplementation = await deploy('OpenOracleFramework');

        // deploy alchemy factory
        oofFactory = await deploy(
            'OOFFactory',
            oofImplementation.address,
            owner.address
        );
    })

    describe('Implementations locked', () => {
        it('OOF', async () => {
            expect(await oofImplementation.factoryContract()).to.eq(`0x${'00'.repeat(19)}01`);
        })
    })

    describe('ConjureMint()', async () => {
        let oof;
        it('Should show the deployed conjure contracts gas consumption', async () => {
            const tx = await oofFactory.oofMint(
                [owner.address],
                1,
                owner.address,
                0
            );
            const {events, cumulativeGasUsed, gasUsed,} = await tx.wait();
            console.log(`Cumulative: ${cumulativeGasUsed.toNumber()}`);
            console.log(`Gas: ${gasUsed.toNumber()}`)
            const [event] = events.filter(e => e.event === "NewOOF");
            oof = await ethers.getContractAt("OpenOracleFramework", event.args.oof);


        })

        it('Check initialize Conjure works propoerly', async () => {
            await expect(oofImplementation.initialize(
                [owner.address],
                1,
                owner.address,
                0,
                owner.address
            )).to.be.revertedWith("already initialized");
        })
        })
});
