pragma solidity ^0.4.23;

import "./Users.sol";


contract Factory is Users {

    bytes32 public symbol;
    bytes32 public  tokenName;
    uint8 public decimals;
    bool private reentrancyLock = false;
    uint private max = 2**256-1;
    uint public rate = 1000;

    constructor() public {
        symbol = "IDF";
        tokenName = "identiFormToken";
        decimals = 18;
    }

    function _buy(address _beneficiary, uint tokens) internal {
        require(_totalSupply.add(tokens) <= max);
        balances[_beneficiary] = balances[_beneficiary].add(tokens);
        _totalSupply = _totalSupply.add(tokens);
        emit Transfer(address(0), _beneficiary, tokens);
    }

    function setRate(uint _rate) public onlyOwner {
        require(_rate > 0 && _rate <= max);
        rate = _rate;
    }

    function () public payable {
        require(!reentrancyLock);
        reentrancyLock = true;
        uint _weiAmount = msg.value;
        address _beneficiary = msg.sender;
        require(_beneficiary != address(0) && _beneficiary != owner);
        require(_weiAmount != 0);
        require(_weiAmount.mul(rate) <= max);
        uint tokens = _weiAmount.mul(rate);
        _buy(_beneficiary, tokens);
        reentrancyLock = false;
    }

    function balance() public view onlyOwner returns (uint) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    function setTeamTokens(uint _tokens) public onlyOwner {
        require(_tokens <= _totalSupply.div(5));
        balances[owner] = _tokens;
        _totalSupply = _totalSupply.add(_tokens);
    }

    function burn(uint _amount) public onlyOwner {
        balances[owner] = balances[owner].sub(_amount);
        _totalSupply = _totalSupply.sub(_amount);
    }

}
