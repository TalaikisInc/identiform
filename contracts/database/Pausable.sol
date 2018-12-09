pragma solidity ^0.4.23;

import "./Ownable.sol";


contract Pausable is Ownable {

    event Pause();
    event Unpause();

    bool public paused = false;

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    modifier whenPaused() {
        require(paused);
        _;
    }

    /*
    * @title Pause contract
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function pause() onlyOwner whenNotPaused public {
        paused = true;
        emit Pause();
    }

    
    /*
    * @title Unpause contract
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function unpause() onlyOwner whenPaused public {
        paused = false;
        emit Unpause();
    }

}
