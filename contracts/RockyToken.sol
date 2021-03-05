// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title RockyToken is the incentive token for rocky.finance. It is distributed to LPs in the first years and burned by admin fees.
 * @notice This token is an ERC20 detailed token with added capability to be minted by the owner.
 */
contract RockyToken is ERC20Burnable, Ownable {
    using SafeMath for uint256;


    string public  _name = "Rocky token";
    string public  _symbol = "ROCKY";   
    uint256 public maxSupply = 22_000 * 10e18;

    /**
     * @notice Deploys RockyFinace Token
     */
    constructor() public ERC20(_name, _symbol) {
        _name;//shhh
    }

    /**
     * @notice Mints the given amount of RockyFinance to the recipient. During the guarded release phase, the total supply
     * and the maximum number of the tokens that a single account can mint are limited.
     * @dev only owner can call this mint function
     * @param recipient address of account to receive the tokens
     * @param amount amount of tokens to mint
     */
    function mint(address recipient, uint256 amount) external onlyOwner {
        require(amount != 0, "amount == 0");
        require(amount.add(totalSupply()) <= maxSupply, "maxSupply exceeded");
        _mint(recipient, amount);
    }

    /**
     * @notice Change name and symbol of the token. Useful for rebranding.
     */
    function setName(string memory name, string memory symbol) public onlyOwner {
        _name = name;
        _symbol = symbol;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public override view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public override view returns (string memory) {
        return _symbol;
    }

}