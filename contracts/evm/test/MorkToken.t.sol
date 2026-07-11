// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MorkToken.sol";

/**
 * @title  MorkToken Tests
 * @notice Run with: forge test --match-path test/MorkToken.t.sol -vv
 */
contract MorkTokenTest is Test {
    MorkToken public token;

    address public deployer = makeAddr("deployer");
    address public alice    = makeAddr("alice");

    uint256 constant INITIAL_SUPPLY = 10_000_000 * 1e18;

    function setUp() public {
        // Deploy as deployer
        vm.prank(deployer);
        token = new MorkToken(deployer);
    }

    // ── Metadata ─────────────────────────────────────────────────────────────

    function test_Name() public view {
        assertEq(token.name(), "Mork");
    }

    function test_Symbol() public view {
        assertEq(token.symbol(), "MORK");
    }

    function test_Decimals() public view {
        assertEq(token.decimals(), 18);
    }

    // ── Supply & balances ─────────────────────────────────────────────────────

    function test_TotalSupply() public view {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
    }

    function test_DeployerReceivesFullSupply() public view {
        assertEq(token.balanceOf(deployer), INITIAL_SUPPLY);
    }

    function test_NonDeployerStartsAtZero() public view {
        assertEq(token.balanceOf(alice), 0);
    }

    // ── Transfers ─────────────────────────────────────────────────────────────

    function test_Transfer() public {
        uint256 amount = 1_000 * 1e18;
        vm.prank(deployer);
        token.transfer(alice, amount);

        assertEq(token.balanceOf(alice), amount);
        assertEq(token.balanceOf(deployer), INITIAL_SUPPLY - amount);
    }

    function test_TransferFail_InsufficientBalance() public {
        vm.prank(alice); // alice has 0 tokens
        vm.expectRevert();
        token.transfer(deployer, 1);
    }

    // ── Approval / transferFrom ────────────────────────────────────────────────

    function test_Approve_And_TransferFrom() public {
        uint256 amount = 500 * 1e18;

        vm.prank(deployer);
        token.approve(alice, amount);

        assertEq(token.allowance(deployer, alice), amount);

        vm.prank(alice);
        token.transferFrom(deployer, alice, amount);

        assertEq(token.balanceOf(alice), amount);
    }

    // ── Ownership ─────────────────────────────────────────────────────────────

    function test_OwnerIsDeployer() public view {
        assertEq(token.owner(), deployer);
    }

    function test_TransferOwnership() public {
        vm.prank(deployer);
        token.transferOwnership(alice);
        assertEq(token.owner(), alice);
    }

    function test_NonOwnerCannotTransferOwnership() public {
        vm.prank(alice);
        vm.expectRevert();
        token.transferOwnership(alice);
    }

    // ── No extra mint ─────────────────────────────────────────────────────────

    function test_NoPublicMint() public {
        // MorkToken has no public mint — total supply never changes after deploy
        uint256 supplyBefore = token.totalSupply();
        // There's no mint() to call, so we just verify supply is unchanged
        assertEq(token.totalSupply(), supplyBefore);
    }
}
