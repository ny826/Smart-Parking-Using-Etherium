var Parking = artifacts.require("./Parking.sol");
module.exports = function(deployer) {
  deployer.deploy(Parking);//passing account 9 as speaker account to the constructor
};
