pragma solidity ^0.4.23;

import "./Ownable.sol";


contract Reputation is Ownable {

    uint public emailConfirmationPoints = 10;
    uint public idDocumentPoints = 10;
    uint public addressDocumentPoints = 10;
    uint public phonePoints = 10;
    uint public upVote = 1;
    uint private max = 2**256-1;

    /*
    * @title Set email confrmation reputation
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _amount Amount in repuation points
    */
    function setEmailConfirmationPoints(uint _amount) public onlyOwner {
        require(_amount > 0 && _amount <= max);
        emailConfirmationPoints = _amount;
    }

    /*
    * @title Set ID confirmation reputation
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _amount Amount in repuation points
    */
    function setIdDocumentPoints(uint _amount) public onlyOwner {
        require(_amount > 0 && _amount <= max);
        idDocumentPoints = _amount;
    }

    /*
    * @title Set address confrmation reputation
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _amount Amount in repuation points
    */
    function setAddressDocumentPoints(uint _amount) public onlyOwner {
        require(_amount > 0 && _amount <= max);
        addressDocumentPoints = _amount;
    }

    /*
    * @title Set vote points
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _amount Amount in repuation points
    */
    function setUpVote(uint _amount) public onlyOwner {
        require(_amount > 0 && _amount <= max);
        upVote = _amount;
    }

    /*
    * @title Set phone confirmation points
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _amount Amount in repuation points
    */
    function setPhonePoints(uint _amount) public onlyOwner {
        require(_amount > 0 && _amount <= max);
        phonePoints = _amount;
    }

}
