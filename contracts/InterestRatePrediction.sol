// SPDX-License-Identifier:MIT
pragma solidity 0.8.19;

contract InterestRatePrediction {
    // Contract administrator address
    address public owner;
    // Bets Deadline Timestamp
    uint256 public deadline;
    // Public interest rate hike time stamp
    uint256 public revealRateDate;
    // total bet Amount
    uint256 public totalAmount;
    // number of winners
    uint256 public winnerCount;
    // Actual interest rate increase
    uint256 public actualRate;
    // Whether the interest rate hike rate has been disclosed
    bool public rateRevealed;
    // Available rate hike options
    uint8[] public rateOptions = [0, 25, 50];
    
    // Mapping relationship between user address and reward amount
    mapping(address => uint256) public rewards;
    // The mapping relationship between interest rate increase rate options and forecast users
    mapping(uint256 => address[]) public predictions;
    // Mapping relationship between user address and bet amount
    mapping(address => uint256) public betAmounts;

    // Modifiers only called by contract administrators
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    // Modifiers that restrict operations before the deadline
    modifier beforeDeadline() {
        require(block.timestamp < deadline, "Cannot predict after deadline.");
        _;
    }

    // Modifier to restrict operations after the deadline
    modifier afterDeadline() {
        require(block.timestamp >= deadline, "Cannot reveal rate before deadline.");
        _;
    }

    // Modifier to restrict operations when the hike rate is undisclosed
    modifier rateNotRevealed() {
        require(!rateRevealed, "Rate has already been revealed.");
        _;
    }

    // contract constructor, pass in the deadline and the date of the public interest rate increase
    constructor(uint256 _deadline, uint256 _revealRateDate) {
        owner = msg.sender;
        deadline = _deadline;
        revealRateDate = _revealRateDate;
    }

    // event
    event eventPredict(address indexed, uint256 indexed rateIndex);
    event eventCancelPrediction(address indexed);
    event eventRevealRate(address indexed, uint256 indexed rateIndex);
    event eventClaimReward(address indexed);

    // Place a bet, pass in the rate hike option index
    function predict(uint256 rateIndex) external payable beforeDeadline {
        // Requires that the user has not participated in the prediction
        require(betAmounts[msg.sender] == 0, "You have already predicted.");
        // Requires that the rate hike option index is valid
        require(rateIndex < rateOptions.length, "Invalid rate index.");

        // record the user's prediction
        predictions[rateIndex].push(msg.sender);
        // Cumulative total bet amount
        totalAmount += msg.value;
        // mark the user's bet amount
        betAmounts[msg.sender] = msg.value;

        emit eventPredict(msg.sender, rateIndex);
    }

    // cancel the bet
    function cancelPrediction() external beforeDeadline {
        require(betAmounts[msg.sender] > 0, "You have not made a prediction.");

        uint256 rateIndex = _findRateIndex(betAmounts[msg.sender]);
        
        uint256 refundAmount = betAmounts[msg.sender];
        totalAmount -= refundAmount;
        betAmounts[msg.sender] = 0;

        // remove the user from the predictions array
        address[] storage userPredictions = predictions[rateIndex];
        for (uint256 i = 0; i < userPredictions.length; i++) {
            if (userPredictions[i] == msg.sender) {
                userPredictions[i] = userPredictions[userPredictions.length - 1];
                userPredictions.pop();
                break;
            }
        }

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed.");

        emit eventCancelPrediction(msg.sender);
    }

    // The contract administrator discloses the actual rate hike rate, and passes in the rate rate option index
    function revealRate(uint256 rateIndex) external onlyOwner afterDeadline rateNotRevealed {
        // Requires that the rate hike option index is valid
        require(rateIndex < rateOptions.length, "Invalid rate index.");
        // It is required that the current time is greater than or equal to the date of the public interest rate hike
        require(block.timestamp >= revealRateDate, "Cannot reveal rate yet.");

        // Set the actual interest rate increase
        actualRate = rateOptions[rateIndex];
        // Count the number of winners
        winnerCount = predictions[rateIndex].length;
        // mark the interest rate hike rate has been published
        rateRevealed = true;

        emit eventRevealRate(msg.sender, rateIndex);
    }

    // Query how many rewards can be received
    function getReward() public view returns (uint256) {
        require(rateRevealed, "Rate not revealed yet.");
        require(betAmounts[msg.sender] > 0, "User did not participate.");

        uint256 rateIndex = _findRateIndex(actualRate);
        address[] storage winners = predictions[rateIndex];

        bool isWinner = false;
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] == msg.sender) {
                isWinner = true;
                break;
            }
        }

        // If the user is not the winner, return 0
        if (!isWinner) {
            return 0;
        }

        // If the user has received it, return 0
        if (rewards[msg.sender] > 0) {
            return 0;
        }

        // Calculate the total bet amount of the winner
        uint256 totalWinnerBetAmount = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            totalWinnerBetAmount += betAmounts[winners[i]];
        }

        // reward = bet amount * (user bet amount / winner's total bet amount)
        uint256 rewardAmount = totalAmount * betAmounts[msg.sender] / totalWinnerBetAmount;
        // user gets 95%
        uint256 userAmount = rewardAmount * 95 / 100;

        return userAmount;
    }

    // Receive award
    function claimReward() external {
        // request rate increase has been made public
        require(rateRevealed, "Rate not revealed yet.");
        // Requires that the user has participated in predictions
        require(betAmounts[msg.sender] > 0, "You did not participate.");
        // Require the user not to have received the reward
        require(rewards[msg.sender] == 0, "You have already claimed your reward.");

        // Find the index of the actual rate hike in the options
        uint256 rateIndex = _findRateIndex(actualRate);
        // get list of winners
        address[] storage winners = predictions[rateIndex];

        // Check if the user is in the winner list
        bool isWinner = false;
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] == msg.sender) {
                isWinner = true;
                break;
            }
        }

        // Require user to be the winner
        require(isWinner, "You did not win.");

        // Calculate the total bet amount of the winner
        uint256 totalWinnerBetAmount = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            totalWinnerBetAmount += betAmounts[winners[i]];
        }

        // reward = bet amount * (user bet amount / winner's total bet amount)
        uint256 rewardAmount = totalAmount * betAmounts[msg.sender] / totalWinnerBetAmount;
        // user gets 95% (add precision factor 1e18 to prevent rounding down)
        uint256 userAmount = rewardAmount * 95 / 100;
        // The administrator charges a 5% handling fee
        uint256 ownerAmount = rewardAmount * 5 / 100;

        // record user rewards
        rewards[msg.sender] = userAmount;

        // Transfer the reward to the user, and check whether the transfer is successful
        (bool success, ) = msg.sender.call{value: userAmount}("");
        require(success, "Transfer failed.");

        // 5% of the handling fee is transferred to the administrator, and at the same time check whether the transfer is successful
        (bool success2, ) = payable(owner).call{value: ownerAmount}("");
        require(success2, "Transfer owner failed.");

        emit eventClaimReward(msg.sender);
    }

    // Find the index of the interest rate hike rate in the options, private function
    function _findRateIndex(uint256 rate) private view returns (uint256) {
        uint256 index;
        for (uint256 i = 0; i < rateOptions.length; i++) {
            if (rateOptions[i] == rate) {
                index = i;
                break;
            }
        }
        return index;
    }

    // Count the number of bettors, private function
    function _getTotalParticipants() private view returns (uint256) {
        uint256 totalParticipants = 0;
        for (uint256 i = 0; i < rateOptions.length; i++) {
            totalParticipants += predictions[i].length;
        }
        return totalParticipants;
    }

    // Get aggregate statistics
    function getRollupInfo() public view returns (
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        bool
    ) {
        // number of bettors
        uint256 totalParticipants = _getTotalParticipants();
        return (
            // number of bettors
            totalParticipants,
            // bet deadline
            deadline,
            // Federal Reserve public time
            revealRateDate,
            // total bet amount
            totalAmount,
            /// number of winners
            winnerCount,
            // Actual interest rate increase
            actualRate,
            // Whether the interest rate increase has been made public
            rateRevealed
        );
    }
}