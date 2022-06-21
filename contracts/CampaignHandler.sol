//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CampaignHandler {
    Campaign[] public campaigns;

    event LogContribute(address sender, uint256 amount, uint32 campaignID);
    event LogNewCampaign(address sender, uint256 goal);
    event LogCloseCampaign(uint32 campaignID, bool isFunded);

    struct Campaign {
        bool isActive;
        bool isFunded;
        string contentName;
        string contentInfo;
        uint256 goal;
        uint256 total;
        uint256 startDate;
        address creator;
        string tokenURI;
    }

    mapping(address => Campaign[]) public creatorToCampaign;

    constructor() {
        console.log("Deploying contract CampaignHandler");
    }

    function contribute(uint256 amount, uint32 campaignID) external payable {
        require(msg.value == amount);

        emit LogContribute(msg.sender, amount, campaignID);

        require(campaigns[campaignID].isActive == true);
        require(
            (campaigns[campaignID].total + amount) <= campaigns[campaignID].goal
        );

        campaigns[campaignID].total += amount;

        (uint256 a, uint256 b) = checkProgress(campaignID);
        if (a - b == 0) closeCampaign(campaignID, true);
    }

    function newCampaign(
        uint256 _goal,
        string memory _contentName,
        string memory _contentInfo,
        string memory _tokenURI
    ) external {
        emit LogNewCampaign(msg.sender, _goal);
        require(_goal > 0, "Campaign goal must be greater than 0 Wei.");

        campaigns.push(
            Campaign(
                true,
                false,
                _contentName,
                _contentInfo,
                _goal,
                0,
                block.timestamp,
                msg.sender,
                _tokenURI
            )
        );
        creatorToCampaign[msg.sender].push(
            Campaign(
                true,
                false,
                _contentName,
                _contentInfo,
                _goal,
                0,
                block.timestamp,
                msg.sender,
                _tokenURI
            )
        );
    }

    function checkProgress(uint32 campaignID)
        public
        view
        returns (uint256, uint256)
    {
        return (campaigns[campaignID].goal, campaigns[campaignID].total);
    }

    function closeCampaign(uint32 campaignID, bool _isFunded) private {
        campaigns[campaignID].isActive = false;
        campaigns[campaignID].isFunded = _isFunded;
        creatorToCampaign[campaigns[campaignID].creator][campaignID]
            .isActive = false;
        creatorToCampaign[campaigns[campaignID].creator][campaignID]
            .isFunded = _isFunded;
        emit LogCloseCampaign(campaignID, _isFunded);
    }

    function listActive() external view returns (Campaign[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].isActive) count++;
        }
        Campaign[] memory _campaigns = new Campaign[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].isActive) {
                _campaigns[j] = campaigns[i];
                j++;
            }
        }
        return _campaigns;
    }

    function listCreatorCampaigns(address creator)
        external
        view
        returns (Campaign[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < creatorToCampaign[creator].length; i++) {
            count++;
        }
        Campaign[] memory _campaigns = new Campaign[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < creatorToCampaign[creator].length; i++) {
            _campaigns[j] = creatorToCampaign[creator][i];
            j++;
        }
        return _campaigns;
    }

    function getCampaignCount() public view returns (uint256) {
        return campaigns.length;
    }

    function getCampaignTokenURI(uint32 campaignID)
        external
        view
        returns (string memory)
    {
        return campaigns[campaignID].tokenURI;
    }

    function withdraw(uint256 amount) external {}
}
