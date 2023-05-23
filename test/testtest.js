const InterestRatePrediction = artifacts.require("InterestRatePrediction");

contract("InterestRatePrediction", (accounts) => {
  let instance;
  const rateOptions = [0, 25, 50];
  const deadline = Math.floor(Date.now() / 1000) + 180; // Set the deadline to 180 seconds after the current time
  const revealRateDate = deadline + 180; // Set the reveal rate date to 180 seconds after the deadline

  before(async () => {
    instance = await InterestRatePrediction.new(deadline, revealRateDate);
  });

  it("should allow users to predict and cancel their predictions before the deadline", async () => {
    const rateIndex = 0; // Set the rate option index to 0
    const betAmount = web3.utils.toWei("1", "ether"); // Set the bet amount to 1 ether
    const user = accounts[1];

    // User makes a prediction
    await instance.predict(rateIndex, { from: user, value: betAmount });

    // Verify if the prediction is recorded correctly
    const userPrediction = await instance.predictions(rateIndex, 0);
    assert.equal(userPrediction, user, "Prediction not recorded correctly");

    // User cancels the prediction
    await instance.cancelPrediction({ from: user });

    // Verify if the prediction is cancelled correctly
    const cancelledPrediction = await instance.predictions(rateIndex, 0);
    assert.equal(cancelledPrediction, "0x0000000000000000000000000000000000000000", "Prediction not cancelled correctly");
  });

  it("should reveal the actual interest rate after the reveal date", async () => {
    const rateIndex = 0; // Set the rate option index to 0
    const owner = accounts[0];

    // Wait for the reveal rate date to pass
    await new Promise((resolve) => setTimeout(resolve, (revealRateDate + 1) * 1000));

    // Contract owner reveals the actual interest rate
    await instance.revealRate(rateIndex, { from: owner });

    // Verify if the actual rate is revealed correctly
    const actualRate = await instance.actualRate();
    assert.equal(actualRate, rateOptions[rateIndex], "Actual rate not revealed correctly");

    // Verify if the rate is marked as revealed correctly
    const rateRevealed = await instance.rateRevealed();
    assert.equal(rateRevealed, true, "Rate not marked as revealed correctly");
  });

  it("should allow users to claim rewards if they predicted the correct rate", async () => {
    const rateIndex = 0; // Set the rate option index to 0
    const betAmount = web3.utils.toWei("1", "ether"); // Set the bet amount to 1 ether
    const user = accounts[1];

    // User makes a prediction
    await instance.predict(rateIndex, { from: user, value: betAmount });

    // Contract owner reveals the actual interest rate
    await instance.revealRate(rateIndex, { from: accounts[0] });

    // User claims the reward
    await instance.claimReward({ from: user });

    // Verify if the user successfully claimed the reward
    const userReward = await instance.rewards(user);
    assert.equal(userReward, betAmount * 0.95, "Reward not claimed correctly");
  });
});
