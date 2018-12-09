pragma solidity ^0.4.21;


contract ERC20 {

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) internal allowed;
    uint public _totalSupply;

    function allowance(address owner, address spender) public view returns (uint);
    function transferFrom(address from, address to, uint tokens) public returns (bool);
    function approve(address spender, uint tokens) public returns (bool);
    function balanceOf(address who) public view returns (uint);
    function transfer(address to, uint tokens) public returns (bool);
    function totalSupply() public view returns (uint);
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);

}
