pragma solidity ^0.4.23;


contract IDentiForm {
    enum UserState {
        Waiting,
        Approved,
        Disapproved
    }

    function getUserState(address _user) public payable returns (UserState, string); 
}
