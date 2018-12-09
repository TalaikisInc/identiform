pragma solidity ^0.4.23;

import "./database/DataBase.sol";


contract Users is DataBase {

    bool private reentrancyLock = false;
    uint private max = 2**256-1;
    event Burn(address indexed _buyer, uint tokens);

    /*
    * @title Reputation raises
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function updateUserReputationEmailConfirmation(address _addr)
    public
    onlyAsOrOwnerOrBy(Role.Admin, _addr) {
        require(existsUser(_addr) == true);
        users[_addr].reputationPoints = users[_addr].reputationPoints.add(emailConfirmationPoints);
    }

    function updateUserReputationIdDocument(address _addr)
    public
    onlyAsOrOwnerOrBy(Role.Admin, _addr) {
        require(existsUser(_addr) == true);
        users[_addr].reputationPoints = users[_addr].reputationPoints.add(idDocumentPoints);
    }

    function updateUserReputationAddressDocument(address _addr)
    public
    onlyAsOrOwnerOrBy(Role.Admin, _addr) {
        require(existsUser(_addr) == true);
        users[_addr].reputationPoints = users[_addr].reputationPoints.add(addressDocumentPoints);
    }

    function updateUserReputationPhone(address _addr)
    public
    onlyAsOrOwnerOrBy(Role.Admin, _addr) {
        require(existsUser(_addr) == true);
        users[_addr].reputationPoints = users[_addr].reputationPoints.add(addressDocumentPoints);
    }

    /*
    * @title Internal token generation event
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _recipient Recipient
    * @param {uint} _tokens Amount of tokens
    */
    function _generateTokens(address _recipient, uint _tokens)
    internal {
        balances[_recipient] = balances[_recipient].add(_tokens);
        _totalSupply = _totalSupply.add(_tokens);
        emit Transfer(address(0), _recipient, _tokens);
    }

    /*
    * @title Internal user registration event
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr Recipient
    * @param {string} _hash Hash
    */
    function _register(address _addr, string _hash, string _publicHash)
    internal {
        require(existsUser(_addr) == false);
        userIndex.push(_addr);
        users[_addr].index = userIndex.length - 1;
        users[_addr]._hash = _hash;
        users[_addr].publicHash = _publicHash;
        users[_addr].paid = false;
        users[_addr].stateIndex.push(UserState.Waiting);
        users[_addr].states[address(this)] = users[_addr].stateIndex.length - 1;
        users[_addr].ref = address(this);
        users[_addr].reputationPoints = 0;
        emit NewUser(_addr, users[_addr].index);
    }

    /*
    * @title New user registration main function
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {string} _hash Hash
    */
    function newUser(string _hash, string _publicHash)
    public
    whenNotPaused
    returns(bool) {
        _register(msg.sender, _hash, _publicHash);
        return true;
    }

    /*
    * @title New ICO/ Airdrop registration main function, paid in ethers
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {string} _hash Hash
    */
    function newManager(string _hash, string _publicHash)
    public payable
    whenNotPaused {
        require(msg.sender != address(0));
        require(existsUser(msg.sender) == true);
        require(existsManager(msg.sender) == false);
        require(!reentrancyLock);
        uint _fee = managerRegistrationFee.add(managerApprovalFee);
        require(_fee <= max);
        require(msg.value == _fee);
        reentrancyLock = true;
        managerIndex.push(msg.sender);
        managers[msg.sender].index = managerIndex.length - 1;
        managers[msg.sender]._hash = _hash;
        managers[msg.sender].publicHash = _publicHash;
        roles[msg.sender] = Role.Manager;
        managers[msg.sender].reputationPoints = 0;
        if (existsRef(msg.sender) == false) {
            refs[msg.sender].index = refIndex.push(msg.sender) - 1;
            emit NewRef(msg.sender, refs[msg.sender].index);
        }
        emit NewManager(msg.sender, managers[msg.sender].index);
        reentrancyLock = false;
    }

    function _burn(address _user, uint _tokens) internal {
        require(_tokens <= balances[_user]);
        balances[_user] = balances[_user].sub(_tokens);
        _totalSupply = _totalSupply.sub(_tokens);
        emit Burn(_user, _tokens);
    }

    /*
    * @title New ICO/ Airdrop registration main function, paid in tokens
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {string} _hash Hash
    */
    function newManagerWithTokens(string _hash, string _publicHash)
    public
    whenNotPaused {
        address _user = msg.sender;
        require(_user != address(0));
        require(existsUser(_user) == true);
        require(existsManager(_user) == false);
        uint _fee = managerRegistrationFeeTokens.add(managerApprovalFeeTokens);
        _burn(_user, _fee);
        managerIndex.push(_user);
        managers[_user].index = managerIndex.length - 1;
        managers[_user]._hash = _hash;
        managers[_user].publicHash = _publicHash;
        roles[_user] = Role.Manager;
        managers[_user].reputationPoints = 0;
        if (existsRef(_user) == false) {
            refs[_user].index = refIndex.push(_user) - 1;
            emit NewRef(_user, refs[_user].index);
        }
        emit NewManager(_user, managers[_user].index);
        reentrancyLock = false;
    }

    /*
    * @title New Referral registration main function, free
    * (until paused and moved to paid)
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function newRef()
    public
    whenNotPaused
    returns(bool) {
        address _user = msg.sender;
        require(existsUser(_user) == true);
        require(existsRef(_user) == false);
        refIndex.push(_user);
        refs[_user].index = refIndex.length - 1;
        emit NewRef(_user, refs[_user].index);
        return true;
    }

    /*
    * @title New rferred user registration function
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {string} _hash Hash
    * @param {address} _ref Referral
    */
    function newUserByRef(string _hash, string _publicHash, address _ref)
    public
    whenNotPaused
    returns(bool) {
        require(existsRef(_ref) == true);
        address _addr = msg.sender;
        require(existsUser(_addr) == false);
        users[msg.sender].ref = _ref;
        userIndex.push(_addr);
        users[_addr].index = userIndex.length - 1;
        users[_addr]._hash = _hash;
        users[_addr].publicHash = _publicHash;
        users[_addr].paid = false;
        users[_addr].stateIndex.push(UserState.Waiting);
        users[_addr].states[_ref] = users[_addr].stateIndex.length - 1;
        users[_addr].ref = _ref;
        users[_addr].reputationPoints = 0;
        emit NewUser(_addr, users[_addr].index);
        refs[_ref].users[msg.sender] = refs[_ref].userIndex.push(msg.sender) - 1;
        emit NewReferred(msg.sender, users[msg.sender].index, _ref);
        return true;
    }

    /*
    * @title Get user by address, only for owner and user
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr User
    */
    function getUser(address _addr)
    onlyAsOrOwnerOrBy(Role.Admin, _addr)
    whenNotPaused
    public
    view
    returns(string, UserState, address, bool, uint) {
        require(existsUser(_addr) == true);
        return(
            users[_addr]._hash,
            users[_addr].stateIndex[users[_addr].states[address(this)]],
            users[_addr].ref,
            users[_addr].paid,
            users[_addr].reputationPoints
        );
    }

    /*
    * @title Get user by ID, only for owner
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {uint} _index User ID
    */
    function getUserAtIndex(uint _index)
    public view
    whenNotPaused
    onlyAsOrOwner(Role.Admin)
    returns(string, UserState, address, bool, uint, address) {
        return (
            users[userIndex[_index]]._hash,
            users[userIndex[_index]].stateIndex[users[userIndex[_index]].states[address(this)]],
            users[userIndex[_index]].ref,
            users[userIndex[_index]].paid,
            users[userIndex[_index]].reputationPoints,
            userIndex[_index]
        );
    }

    function getRefUserAtIndex(uint _index, address _ref)
    public view
    whenNotPaused
    onlyAsOrOwner(Role.Manager)
    returns(address) {
        require(existsRef(_ref) == true);
        return refs[_ref].userIndex[_index];
    }

    function getUserPublic(uint _index)
    public view
    whenNotPaused
    returns(address, string, uint) {
        return (
            userIndex[_index],
            users[userIndex[_index]].publicHash,
            users[userIndex[_index]].reputationPoints
        );
    }

    function getUserPublicAddr(address _addr)
    public view
    returns(address, string, uint) {
        require(existsUser(_addr) == true);
        return (
            userIndex[users[_addr].index],
            users[_addr].publicHash,
            users[_addr].reputationPoints
        );
    }

    function getUserState(address _user)
    public view
    whenNotPaused
    isWhitelisted(msg.sender)
    returns (UserState, string, address) {
        require(existsUser(_user) == true);
        return (
            users[_user].stateIndex[users[_user].states[msg.sender]],
            users[_user].rulesHash,
            _user
        );
    }

    function getUserStateAtIndex(uint _index)
    public view
    whenNotPaused
    isWhitelisted(msg.sender)
    returns (UserState, string, address) {
        require(existsUser(userIndex[_index]) == true);
        return (
            users[userIndex[_index]].stateIndex[users[userIndex[_index]].states[msg.sender]],
            users[userIndex[_index]].rulesHash,
            userIndex[_index]
        );
    }

    function getManagerAtIndex(uint _index)
    public
    whenNotPaused
    onlyAsOrOwner(Role.Admin)
    view returns(address, string, string, uint) {
        return (
            managerIndex[_index],
            managers[managerIndex[_index]]._hash,
            managers[managerIndex[_index]].publicHash,
            managers[managerIndex[_index]].reputationPoints
        );
    }

    function getManagerAtIndexPublic(uint _index)
    public
    whenNotPaused
    view returns(address, string, uint) {
        return (
            managerIndex[_index],
            managers[managerIndex[_index]].publicHash,
            managers[managerIndex[_index]].reputationPoints
        );
    }

    function getManager(address _addr)
    onlyAsOrOwnerOrBy(Role.Admin, _addr)
    whenNotPaused
    public view
    returns(string, string, uint) {
        require(existsManager(_addr) == true);
        return(
            managers[_addr]._hash,
            managers[_addr].publicHash,
            managers[_addr].reputationPoints
        );
    }

    function getManagerPublic(address _addr)
    whenNotPaused
    public view
    returns(address, string, uint) {
        require(existsManager(_addr) == true);
        return(
            managerIndex[managers[_addr].index],
            managers[_addr].publicHash,
            managers[_addr].reputationPoints
        );
    }

    /*
    * @title UPDATE(s)
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function updateUser(address _addr, string _hash, string publicHash)
    onlyBy(_addr)
    whenNotPaused
    public
    returns(bool) {
        require(existsUser(msg.sender) == true);
        users[msg.sender]._hash = _hash;
        users[msg.sender].publicHash = publicHash;
        emit UpdateUser(msg.sender, users[msg.sender].index);
        return true;
    }

    /*
    * @title Update public information about user
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr User's address
    * @param {hash} _hash Public hash
    */
    function updatePublicInfo(address _addr, string _hash)
    onlyOwnerOrBy(_addr)
    whenNotPaused
    public
    returns(bool) {
        require(existsUser(msg.sender) == true);
        users[msg.sender].publicHash = _hash;
        emit UpdateUser(msg.sender, users[msg.sender].index);
        return true;
    }

    /*
    * @title Update rules information about user
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr User's address
    * @param {hash} _hash Rules hash
    */
    function updateRulesInfo(address _addr, string _hash)
    onlyAsOrOwner(Role.Manager)
    whenNotPaused
    public
    returns(bool) {
        require(existsUser(_addr) == true);
        users[_addr].rulesHash = _hash;
        emit UpdateUser(_addr, users[_addr].index);
        return true;
    }

    function updateManager(address _addr, string _hash, string _publicHash)
    onlyBy(_addr)
    public
    returns(bool) {
        require(existsManager(msg.sender) == true);
        managers[msg.sender]._hash = _hash;
        managers[msg.sender].publicHash = _publicHash;
        emit UpdateManager(msg.sender, managers[msg.sender].index);
        return true;
    }

    /*
    * @title DELETE(s)
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function _delete(address _addr)
    internal {
        require(existsUser(_addr) == true);
        if (users[_addr].ref != address(this)) {
            address _ref = users[_addr].ref;
            if (existsRef(_ref)) {
                uint _refRowToDelete = refs[_ref].users[_addr];
                address _refKeyToMove = refs[_ref].userIndex[refs[_ref].userIndex.length - 1];
                refs[_ref].userIndex[_refRowToDelete] = _refKeyToMove;
                refs[_ref].users[_keyToMove] = _refRowToDelete;
                refs[_ref].userIndex.length--;
            }
        }
        uint _rowToDelete = users[_addr].index;
        address _keyToMove = userIndex[userIndex.length - 1];
        userIndex[_rowToDelete] = _keyToMove;
        users[_keyToMove].index = _rowToDelete; 
        userIndex.length--;
        emit DeleteUser(msg.sender, _rowToDelete);
        emit UpdateUser(_keyToMove, _rowToDelete);
    }

    function deleteUser(address _addr)
    public
    onlyBy(_addr)
    whenNotPaused
    returns(bool) {
        _delete(_addr);
        return true;
    }

    function deleteManager(address _addr)
    public
    onlyBy(_addr)
    returns(uint index) {
        require(existsManager(msg.sender) == true);
        uint _rowToDelete = managers[msg.sender].index;
        address _keyToMove = managerIndex[managerIndex.length - 1];
        managerIndex[_rowToDelete] = _keyToMove;
        managers[_keyToMove].index = _rowToDelete; 
        managerIndex.length--;
        emit DeleteManager(msg.sender, _rowToDelete);
        emit UpdateManager(_keyToMove, _rowToDelete);
        return _rowToDelete;
    }

    /*
    * @title Delete referral
    * @author Tadas Talaikis <info@talaikis.com>
    * @dev Deletes the referral.
    */
    function deleteRef(address _addr)
    public
    onlyBy(_addr)
    returns(bool) {
        require(existsRef(msg.sender) == true);
        uint _rowToDelete = refs[msg.sender].index;
        address _keyToMove = refIndex[userIndex.length - 1];
        refIndex[_rowToDelete] = _keyToMove;
        refs[_keyToMove].index = _rowToDelete; 
        refIndex.length--;
        emit DeleteRef(msg.sender, _rowToDelete);
        emit UpdateRef(_keyToMove, _rowToDelete);
        return true;
    }

    /*
    * @title Numbers
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function getUserCount()
    public view
    returns(uint count) {
        return userIndex.length;
    }

    function getManagersCount()
    public view
    returns(uint) {
        return managerIndex.length;
    }

    function getRefCount()
    public view
    returns(uint) {
        return refIndex.length;
    }

    function getRefUsersCount(address _ref)
    public view
    returns(uint) {
        require(existsRef(_ref) == true);
        return refs[_ref].userIndex.length;
    }

    /*
    * @title Etc.
    * @author Tadas Talaikis <info@talaikis.com>
    */
    function setUserStatus(address _user, UserState _state, address _ruleBook)
    public
    onlyAsOrOwner(Role.Admin)
    returns (bool) {
        if (users[_user].paid == false) {
            if (_state == UserState.Approved) {
                _generateTokens(_user, registrationBonus);

                if (users[_user].ref != address(this)) {
                    _generateTokens(users[_user].ref, referralBonus);
                }
            }

            users[_user].paid = true;
        }

        users[_user].stateIndex.push(_state);
        users[_user].states[_ruleBook] = users[_user].stateIndex.length - 1;

        return true;
    }

    /*
    * @title User address change
    * @author Tadas Talaikis <info@talaikis.com>
    * @dev Ability for user to move his data to another address.
    */
    function changeAddress(address _user, address _newAddress)
    public
    onlyBy(_user) {
        require(existsUser(_user) == true);
        require(_newAddress != address(0));
        _register(_newAddress, users[_user]._hash, users[_user].publicHash);
        _delete(msg.sender);
        emit OwnershipTransferred(_user, _newAddress);
    }

    /*
    * @title Upvote user
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr Recipient
    */
    function upVoteUser(address _addr)
    public {
        require(existsUser(_addr) == true);
        require(_addr != msg.sender);
        require(balances[msg.sender] >= voteFeeTokens);
        users[_addr].reputationPoints = users[_addr].reputationPoints.add(upVote);
        _burn(msg.sender, voteFeeTokens);
    }

    /*
    * @title Downvote user
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr Recipient
    */
    function downVoteUser(address _addr)
    public {
        require(existsUser(_addr) == true);
        require(_addr != msg.sender);
        require(users[_addr].reputationPoints.sub(upVote) >= 0);
        require(balances[msg.sender] >= voteFeeTokens);
        users[_addr].reputationPoints = users[_addr].reputationPoints.sub(upVote);
        _burn(msg.sender, voteFeeTokens);
    }

    /*
    * @title Upvote ICO/ Airdrop
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr Recipient
    */
    function upVoteManager(address _addr)
    public {
        require(existsManager(_addr) == true);
        require(_addr != msg.sender);
        require(balances[msg.sender] >= voteFeeTokens);
        managers[_addr].reputationPoints = managers[_addr].reputationPoints.add(upVote);
        _burn(msg.sender, voteFeeTokens);
    }

    /*
    * @title Downvote ICO/ Airdrop
    * @author Tadas Talaikis <info@talaikis.com>
    * @param {address} _addr Recipient
    */
    function downVoteManager(address _addr)
    public {
        require(existsManager(_addr) == true);
        require(_addr != msg.sender);
        require(managers[_addr].reputationPoints.sub(upVote) >= 0);
        require(balances[msg.sender] >= voteFeeTokens);
        managers[_addr].reputationPoints = managers[_addr].reputationPoints.sub(upVote);
        _burn(msg.sender, voteFeeTokens);
    }

}
