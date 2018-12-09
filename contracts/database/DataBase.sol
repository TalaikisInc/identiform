pragma solidity ^0.4.23;

import "./Roles.sol";
import "./Bonus.sol";
import "./Reputation.sol";
import "./Fees.sol";
import "./Pausable.sol";
import "./Basic.sol";


contract DataBase is Basic, Roles, Bonus, Reputation, Fees, Pausable {
    enum UserState {
        Waiting,
        Approved,
        Disapproved
    }

    struct ManagerStruct {
        uint index;
        string _hash;
        uint reputationPoints;
        string publicHash;
    }

    struct RefStruct {
        uint index;
        address[] userIndex;
        mapping (address => uint) users;
    }

    struct UserStruct {
        uint index;
        string _hash;
        UserState[] stateIndex;
        uint reputationPoints;
        address ref;
        bool paid;
        string publicHash;
        string rulesHash;
        mapping (address => uint) states;
    }

    mapping (address => UserStruct) public users;
    address[] public userIndex;
    mapping (address => ManagerStruct) public managers;
    address[] public managerIndex;
    mapping (address => RefStruct) public refs;
    address[] public refIndex;
    mapping(address => bool) internal whitelist;

    event NewUser(address indexed _addr, uint _index);
    event UpdateUser(address indexed _addr,  uint _index);
    event DeleteUser(address indexed _addr,  uint _index);
    event NewManager(address indexed _addr, uint _index);
    event UpdateManager(address indexed _addr,  uint _index);
    event DeleteManager(address indexed _addr,  uint _index);
    event NewRef(address indexed _addr, uint _index);
    event DeleteRef(address indexed _addr,  uint _index);
    event UpdateRef(address indexed _addr,  uint _index);
    event NewReferred(address indexed _addr, uint _index,  address _ref);

    modifier isWhitelisted(address _beneficiary) {
        require(whitelist[_beneficiary]);
        _;
    }

    /*
    * @title Check if user is registered
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr User's address
    */
    function existsUser(address _addr) public view returns(bool isIndexed) {
        if (userIndex.length == 0) {
            return false;
        }
        return (userIndex[users[_addr].index] == _addr);
    }

    /*
    * @title Check if user is referral
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr User's address
    */
    function existsRef(address _addr) public view returns(bool isIndexed) {
        if (refIndex.length == 0) {
            return false;
        }
        return (refIndex[refs[_addr].index] == _addr);
    }

    /*
    * @title Check if user is manager
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr User's address
    */
    function existsManager(address _addr) public view returns(bool isIndexed) {
        if (managerIndex.length == 0) {
            return false;
        }
        return (managerIndex[managers[_addr].index] == _addr);
    }

    /*
    * @title Add manager to Whitelist
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _mannager Manager's address
    * @dev Since we collected entire fee previously, we do nothing else here.
    */
    function addToWhitelist(address _manager) public onlyAsOrOwner(Role.Admin) {
        require(existsManager(_manager) == true);
        whitelist[_manager] = true;
    }

    /*
    * @title Remove manager from Whitelist
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _mannager Manager's address
    * @dev When removing, we refund approval fee in tokens.
    */
    function removeFromWhitelist(address _manager) public onlyAsOrOwner(Role.Admin) isWhitelisted(_manager) {
        require(existsManager(_manager) == true);
        balances[_manager] = balances[_manager].add(managerApprovalFeeTokens);
        _totalSupply = _totalSupply.add(managerApprovalFeeTokens);
        whitelist[_manager] = false;
    }

    /*
    * @title Get manager Whitelist status
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _mannager Manager's address
    */
    function getWhitelistStatus(address _manager) public view onlyAsOrOwner(Role.Admin) returns (bool) {
        require(existsManager(_manager) == true);
        return whitelist[_manager];
    }

}
