pragma solidity ^0.4.21;

import "./SafeMath.sol";
import "./ERC20.sol";


contract Basic is ERC20 {

    using SafeMath for uint;

    modifier onlyTokenholder() {
        require(balances[msg.sender] > 0);
        _;
    }

    function balanceOf(address _tokenOwner) public view returns (uint balance) {
        return balances[_tokenOwner];
    }

    function allowance(address _tokenOwner, address _spender) public view returns (uint remaining) {
        return allowed[_tokenOwner][_spender];
    }

    function transfer(address _to, uint _tokens) public returns (bool success) {
        require(_to != address(0));
        require(_tokens <= balances[msg.sender] && _tokens > 0);

        balances[msg.sender] = balances[msg.sender].sub(_tokens);
        balances[_to] = balances[_to].add(_tokens);
        emit Transfer(msg.sender, _to, _tokens);
        return true;
    }

    function approve(address _spender, uint _tokens) public returns (bool success) {
        allowed[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);
        return true;
    }

    function transferFrom(address _from, address _to, uint _tokens) public returns (bool success) {
        require(_to != address(0));
        require(_tokens <= balances[_from]);
        require(_tokens <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_tokens);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_tokens);
        balances[_to] = balances[_to].add(_tokens);
        emit Transfer(_from, _to, _tokens);
        return true;
    }

    function totalSupply() public view returns (uint) {
        return _totalSupply;
    }

}
