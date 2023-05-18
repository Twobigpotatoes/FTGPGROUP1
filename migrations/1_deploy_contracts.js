const InterestRatePrediction = artifacts.require("InterestRatePrediction");

module.exports = async function (deployer) {
    // Need to pass in 2 timestamps
    // Betting cut-off timestamp and open rate timestamp
    const now = Math.floor(Date.now() / 1000);
    // Betting deadline, open interest rate
    deployer.deploy(InterestRatePrediction, now + 180, now + 180);
}