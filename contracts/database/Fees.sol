pragma solidity ^0.4.23;

import "./Ownable.sol";


contract Fees is Ownable {

    uint public managerRegistrationFee = 1 ether;
    uint public managerApprovalFee = 5 ether;

    uint public managerRegistrationFeeTokens = 10000 * 10 ** 18;
    uint public managerApprovalFeeTokens = 50000 * 10 ** 18;
    uint public voteFeeTokens = 10 * 10 ** 18;
    uint private max = 2**256-1;

    /*
    * @title Set manager registration fee
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _fee Fee in wei
    */
    function setManagerRegistrationFee(uint _fee)
    public
    onlyOwner {
        require(_fee > 0 && _fee <= max);
        managerRegistrationFee = _fee;
    }

    /*
    * @title Set manager approval fee
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _fee Fee in wei
    */
    function setManagerApprovalFee(uint _fee)
    public
    onlyOwner {
        require(_fee > 0 && _fee <= max);
        managerApprovalFee = _fee;
    }

    /*
    * @title Set manager registration fee in tokens
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _fee Fee in tokens
    */
    function setManagerRegistrationFeeTokens(uint _fee)
    public
    onlyOwner {
        require(_fee > 0 && _fee <= max);
        managerRegistrationFeeTokens = _fee;
    }

    /*
    * @title Set manager approval fee in tokens
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _fee Fee in tokens
    */
    function setManagerApprovalFeeTokens(uint _fee)
    public
    onlyOwner {
        require(_fee > 0 && _fee <= max);
        managerApprovalFeeTokens = _fee;
    }

    /*
    * @title Set voting fee in tokens
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _fee Fee in tokens
    */
    function setVoteFeeTokens(uint _fee)
    public
    onlyOwner {
        require(_fee > 0 && _fee <= max);
        voteFeeTokens = _fee;
    }

}
