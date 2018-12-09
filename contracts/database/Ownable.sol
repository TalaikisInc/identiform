pragma solidity ^0.4.23;


contract Ownable {

    address public owner;
    address public bot;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    modifier onlyOwnerOrBy(address _account) {
        require(msg.sender == _account || msg.sender == owner);
        _;
    }

    modifier botOnly() {
        require(msg.sender == bot);
        _;
    }

    /*
    * @title Set bot
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _bot Address of bot
    */
    function setBot(address _bot) external onlyOwner {
        bot = _bot;
    }

    /*
    * @title Validate if user is owner
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function validate() public view returns (bool) {
        return (msg.sender == owner);
    }

    /*
    * @title Transfer ownership of contract
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _newOwner Address of new owner
    */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0));
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

}
