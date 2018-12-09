pragma solidity ^0.4.23;

import "./Ownable.sol";


contract Bonus is Ownable {

    uint public registrationBonus = 1000 * 10 ** 18;
    uint public referralBonus = 100 * 10 ** 18;
    uint private max = 2**256-1;

    /*
    * @title Set registration bonus
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _amount Bonus in tokens
    */
    function setRegistrationBonus(uint _amount) public onlyOwner {
        require(_amount > 0 && _amount <= max);
        registrationBonus = _amount;
    }

    /*
    * @title Set referral bonus
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _amount Bonus in tokens
    */
    function setReferralBonus(uint _amount) public onlyOwner {
        require(_amount > 0 && _amount <= max);
        referralBonus = _amount;
    }

}
