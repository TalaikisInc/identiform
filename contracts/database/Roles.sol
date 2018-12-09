pragma solidity ^0.4.23;

import "./Ownable.sol";


contract Roles is Ownable {

    enum Role {
        Default,
        Admin,
        Manager,
        SuperAdmin
    }

    mapping(address => Role) internal roles;

    modifier onlyAs(Role _role) {
        require(roles[msg.sender] == _role);
        _;
    }

    modifier onlyAsOrOwner(Role _role) {
        require(roles[msg.sender] == _role || msg.sender == owner);
        _;
    }

    modifier onlyAsOrOwnerOrBy(Role _role, address _account) {
        require(msg.sender == _account || msg.sender == owner || roles[msg.sender] == _role);
        _;
    }

    /*
    * @title Set user's role
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _user User's address
    * @param {Role} _role Role ID
    * @dev only owner or suepr admin can set this to avoid removal 
    * of role from owner itsefl
    */
    function setUserRole(address _user, Role _role)
    public
    onlyAsOrOwner(Role.SuperAdmin)
    returns (bool) {
        roles[_user] = _role;
        return true;
    }

    /*
    * @title Get user's role
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _user Amount in repuation points
    */
    function getRole(address _user) public view returns (Role) {
        return roles[_user];
    }

    /*
    * @title Validate as role
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {Role} _role Role ID
    */
    function validateAs(Role _role) public view returns (bool) {
        return (roles[msg.sender] == _role);
    }

}
