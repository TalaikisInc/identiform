import ether from './helpers/ether';
const BigNumber = web3.BigNumber;
require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should();
const Token = artifacts.require('Factory');

contract('identiForm', ([owner, wallet, investor, otherInvestor]) => {
  describe('init', () => {
    it('has an owner', async () => {
      const token = await Token.new();
      const originalOwner = await token.owner();
      originalOwner.should.equal(owner);
    });

    it('should have correct parameters', async () => {
      const token = await Token.new();
      const symbol = web3.toUtf8(await token.symbol());
      const tokenName = web3.toUtf8(await token.tokenName());
      const decimals = await token.decimals();
      symbol.should.be.equal('IDF');
      tokenName.should.be.equal('identiFormToken');
      decimals.should.be.bignumber.equal(18);
    });

    it('should get correct user count', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      const cnt = await token.getUserCount();
      cnt.toNumber().should.be.equal(2);
    });
  });

  describe('roles', () => {
    it('add admin role', async () => {
      const token = await Token.new();
      await token.setUserRole(investor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(investor, { from: owner });
      role.toNumber().should.be.equal(1);
      let validateAs;
      validateAs = await token.validateAs(1, { from: investor });
      validateAs.should.be.equal(true);
      validateAs = await token.validateAs(1, { from: otherInvestor });
      validateAs.should.be.equal(false);
    });

    it('add manager role', async () => {
      const token = await Token.new();
      await token.setUserRole(investor, 2, { from: owner, gas: 1000000 });
      const role = await token.getRole(investor, { from: owner });
      role.toNumber().should.be.equal(2);
      let validateAs;
      validateAs = await token.validateAs(2, { from: investor });
      validateAs.should.be.equal(true);
      validateAs = await token.validateAs(2, { from: otherInvestor });
      validateAs.should.be.equal(false);
    });

    it('add super admin role', async () => {
      const token = await Token.new();
      await token.setUserRole(investor, 3, { from: owner, gas: 1000000 });
      const role = await token.getRole(investor, { from: owner });
      role.toNumber().should.be.equal(3);
      let validateAs;
      validateAs = await token.validateAs(3, { from: investor });
      validateAs.should.be.equal(true);
      validateAs = await token.validateAs(3, { from: otherInvestor });
      validateAs.should.be.equal(false);
    });

    it('allow for super admins to set roles', async () => {
      const token = await Token.new();
      await token.setUserRole(investor, 3, { from: owner, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: investor, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: otherInvestor });
      role.toNumber().should.be.equal(1);
    });

    it('disallow to set roles for admins', async () => {
      const token = await Token.new();
      await token.setUserRole(investor, 1, { from: owner, gas: 1000000 });
      const logs = await token.setUserRole(investor, 0, { from: investor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      let validateAs;
      validateAs = await token.validateAs(0, { from: investor });
      validateAs.should.be.equal(false);
      validateAs = await token.validateAs(1, { from: investor });
      validateAs.should.be.equal(true);
    });

    it('disallow to set roles for users', async () => {
      const token = await Token.new();
      await token.setUserRole(investor, 0, { from: owner, gas: 1000000 });
      const logs = await token.setUserRole(investor, 1, { from: investor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      let validateAs;
      validateAs = await token.validateAs(0, { from: investor });
      validateAs.should.be.equal(true);
      validateAs = await token.validateAs(1, { from: investor });
      validateAs.should.be.equal(false);
    });

    it('disallow to set roles for managers', async () => {
      const token = await Token.new();
      await token.setUserRole(investor, 2, { from: owner, gas: 1000000 });
      const logs = await token.setUserRole(investor, 1, { from: investor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      let validateAs;
      validateAs = await token.validateAs(0, { from: investor });
      validateAs.should.be.equal(false);
      validateAs = await token.validateAs(2, { from: investor });
      validateAs.should.be.equal(true);
    });
  });

  describe('bonuses', () => {
    it('set registration bonus', async () => {
      const token = await Token.new();
      await token.setRegistrationBonus(100, { from: owner, gas: 1000000 });
      const bonus = await token.registrationBonus();
      bonus.should.be.bignumber.equal(100);
    });

    it('set referral bonus', async () => {
      const token = await Token.new();
      await token.setReferralBonus(100, { from: owner, gas: 1000000 });
      const bonus = await token.referralBonus();
      bonus.should.be.bignumber.equal(100);
    });
  });

  describe('fees', () => {
    it('set vote fee', async () => {
      const token = await Token.new();
      await token.setVoteFeeTokens(100, { from: owner, gas: 1000000 });
      const fee = await token.voteFeeTokens();
      fee.should.be.bignumber.equal(100);
    });

    it('set manager registration fee', async () => {
      const token = await Token.new();
      await token.setManagerRegistrationFee(10000000000, { from: owner, gas: 1000000 });
      const fee = await token.managerRegistrationFee();
      fee.should.be.bignumber.equal(10000000000);
    });

    it('set manager approval fee', async () => {
      const token = await Token.new();
      await token.setManagerApprovalFee(10000000000, { from: owner, gas: 1000000 });
      const fee = await token.managerApprovalFee();
      fee.should.be.bignumber.equal(10000000000);
    });

    it('set manager registration fee tokens', async () => {
      const token = await Token.new();
      await token.setManagerRegistrationFeeTokens(10000000000, { from: owner, gas: 1000000 });
      const fee = await token.managerRegistrationFeeTokens();
      fee.should.be.bignumber.equal(10000000000);
    });

    it('set manager approval fee tokens', async () => {
      const token = await Token.new();
      await token.setManagerApprovalFeeTokens(10000000000, { from: owner, gas: 1000000 });
      const fee = await token.managerApprovalFeeTokens();
      fee.should.be.bignumber.equal(10000000000);
    });
  });

  describe('votes and reputations', () => {
    it('upvote user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(1) });
      await token.upVoteUser(investor, { from: otherInvestor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[0].should.be.equal(investor);
      userData[1].should.be.equal('pub hash');
      userData[2].toNumber().should.be.equal(1);
    });

    it('upvote myself is denied', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.sendTransaction({ from: investor, gas: 1000000, value: ether(1) });
      const logs = await token.upVoteUser(investor, { from: investor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('downvote user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(1) });
      await token.upVoteUser(investor, { from: otherInvestor, gas: 1000000 });
      await token.upVoteUser(investor, { from: otherInvestor, gas: 1000000 });
      await token.downVoteUser(investor, { from: otherInvestor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[0].should.be.equal(investor);
      userData[1].should.be.equal('pub hash');
      userData[2].toNumber().should.be.equal(1);
    });

    it('up repuation from email from owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationEmailConfirmation(investor, { from: owner, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from email from user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationEmailConfirmation(investor, { from: investor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from ID from owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationIdDocument(investor, { from: owner, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from ID from user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationIdDocument(investor, { from: investor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from address from owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationAddressDocument(investor, { from: owner, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from address from user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationAddressDocument(investor, { from: investor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('set email confirmation points', async () => {
      const token = await Token.new();
      await token.setEmailConfirmationPoints(10000000000, { from: owner, gas: 1000000 });
      const rep = await token.emailConfirmationPoints();
      rep.should.be.bignumber.equal(10000000000);
    });

    it('set ID confirmation points', async () => {
      const token = await Token.new();
      await token.setIdDocumentPoints(10000000000, { from: owner, gas: 1000000 });
      const rep = await token.idDocumentPoints();
      rep.should.be.bignumber.equal(10000000000);
    });

    it('set address confirmation points', async () => {
      const token = await Token.new();
      await token.setAddressDocumentPoints(10000000000, { from: owner, gas: 1000000 });
      const rep = await token.addressDocumentPoints();
      rep.should.be.bignumber.equal(10000000000);
    });

    it('set up vote', async () => {
      const token = await Token.new();
      await token.setUpVote(10000000000, { from: owner, gas: 1000000 });
      const rep = await token.upVote();
      rep.should.be.bignumber.equal(10000000000);
    });

    it('set phone confirmation points', async () => {
      const token = await Token.new();
      await token.setPhonePoints(10000000000, { from: owner, gas: 1000000 });
      const rep = await token.phonePoints();
      rep.should.be.bignumber.equal(10000000000);
    });

    it('up repuation from email from admin', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      await token.updateUserReputationEmailConfirmation(investor, { from: otherInvestor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from ID from admin', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      await token.updateUserReputationIdDocument(investor, { from: otherInvestor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from address from admin', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      await token.updateUserReputationAddressDocument(investor, { from: otherInvestor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from phone from owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationPhone(investor, { from: owner, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: otherInvestor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from phone from user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationPhone(investor, { from: investor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: investor });
      userData[2].toNumber().should.be.equal(10);
    });

    it('up repuation from phone from admin', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      await token.updateUserReputationPhone(investor, { from: otherInvestor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: owner });
      userData[2].toNumber().should.be.equal(10);
    });

    it('multi ups from user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationAddressDocument(investor, { from: investor, gas: 1000000 });
      await token.updateUserReputationIdDocument(investor, { from: investor, gas: 1000000 });
      await token.updateUserReputationIdDocument(investor, { from: investor, gas: 1000000 });
      await token.updateUserReputationEmailConfirmation(investor, { from: investor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: owner });
      userData[2].toNumber().should.be.equal(40);
    });

    it('multi ups from admin', async () => {
      const token = await Token.new();
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUserReputationAddressDocument(investor, { from: otherInvestor, gas: 1000000 });
      await token.updateUserReputationIdDocument(investor, { from: otherInvestor, gas: 1000000 });
      await token.updateUserReputationIdDocument(investor, { from: otherInvestor, gas: 1000000 });
      await token.updateUserReputationEmailConfirmation(investor, { from: otherInvestor, gas: 1000000 });
      const userData = await token.getUserPublicAddr(investor, { from: owner });
      userData[2].toNumber().should.be.equal(40);
    });

    it('disallow ups from others', async () => {
      let logs;
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      logs = await token.updateUserReputationAddressDocument(investor, { from: otherInvestor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      logs = await token.updateUserReputationIdDocument(investor, { from: otherInvestor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      logs = await token.updateUserReputationIdDocument(investor, { from: otherInvestor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      logs = await token.updateUserReputationEmailConfirmation(investor, { from: otherInvestor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      const userData = await token.getUserPublicAddr(investor, { from: owner });
      userData[2].toNumber().should.be.equal(0);
    });

    it('upvote manager', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 40000000, value: ether(6) });
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(1) });
      await token.upVoteManager(investor, { from: otherInvestor });
      await token.upVoteManager(investor, { from: otherInvestor });
      await token.upVoteManager(investor, { from: otherInvestor });
      const data = await token.getManagerPublic(investor, { from: otherInvestor });
      data[0].should.be.equal(investor);
      data[1].should.be.equal('company pub hash');
      data[2].toNumber().should.be.equal(3);
    });

    it('downvote manager', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(10) });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      await token.upVoteManager(investor, { from: otherInvestor });
      await token.upVoteManager(investor, { from: otherInvestor });
      await token.upVoteManager(investor, { from: otherInvestor });
      await token.downVoteManager(investor, { from: otherInvestor });
      let data;
      data = await token.getManagerPublic(investor, { from: otherInvestor });
      data[2].toNumber().should.be.equal(2);
      await token.downVoteManager(investor, { from: otherInvestor });
      data = await token.getManagerPublic(investor, { from: otherInvestor });
      data[2].toNumber().should.be.equal(1);
    });
  });

  describe('users', () => {
    it('update user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updateUser(investor, 'hash 2', 'pub hash 2', { from: investor, gas: 1000000 });
      const data = await token.getUser(investor, { from: owner });
      data[0].should.be.equal('hash 2');
      data[1].toNumber().should.be.equal(0);
      data[2].should.be.equal(await token.address);
      data[3].should.be.equal(false);
      data[4].toNumber().should.be.equal(0);
    });

    it('not allow to update user for others', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      let logs;
      logs = await token.updateUser(investor, 'hash 2', 'pub hash 2', { from: otherInvestor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      logs = await token.updateUser(investor, 'hash 2', 'pub hash 2', { from: owner, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('delete user', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      const { logs } = await token.deleteUser(investor, { from: investor, gas: 1000000 });
      logs[0].event.should.be.equal('DeleteUser');
    });

    it('not allow to delete user for others', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      let logs;
      logs = await token.deleteUser(investor, { from: otherInvestor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      logs = await token.deleteUser(investor, { from: owner, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('get user at index for owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      const data = await token.getUserAtIndex(0, { from: owner });
      data[0].should.be.equal('hash');
      data[1].toNumber().should.be.equal(0);
      data[2].should.be.equal(await token.address);
      data[3].should.be.equal(false);
      data[4].toNumber().should.be.equal(0);
      data[5].should.be.equal(investor);
    });

    it('get user at index for admin', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);
      const data = await token.getUserAtIndex(0, { from: otherInvestor });
      data[0].should.be.equal('hash');
      data[1].toNumber().should.be.equal(0);
      data[2].should.be.equal(await token.address);
      data[3].should.be.equal(false);
      data[4].toNumber().should.be.equal(0);
      data[5].should.be.equal(investor);
    });

    it('get user at index for admin where more than one exists', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash 2', 'pub hash 2', { from: otherInvestor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);
      const data = await token.getUserAtIndex(1, { from: otherInvestor });
      data[0].should.be.equal('hash 2');
      data[1].toNumber().should.be.equal(0);
      data[2].should.be.equal(await token.address);
      data[3].should.be.equal(false);
      data[4].toNumber().should.be.equal(0);
      data[5].should.be.equal(otherInvestor);
    });

    it('get user public', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash 2', 'pub hash 2', { from: otherInvestor, gas: 1000000 });
      let data;
      data = await token.getUserPublic(0);
      data[0].should.be.equal(investor);
      data[1].should.be.equal('pub hash');
      data[2].toNumber().should.be.equal(0);
      data = await token.getUserPublic(1);
      data[0].should.be.equal(otherInvestor);
      data[1].should.be.equal('pub hash 2');
      data[2].toNumber().should.be.equal(0);
    });

    it('update public info', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.updatePublicInfo(investor, 'pub 2 hash', { from: investor, gas: 1000000 });
      const data = await token.getUserPublicAddr(investor);
      data[0].should.be.equal(investor);
      data[1].should.be.equal('pub 2 hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('change address', async () => {
      const token = await Token.new();
      await token.newUser('zzzzzzzzzzAA', 'pub hash', { from: investor, gas: 1000000 });
      const { logs } = await token.changeAddress(investor, otherInvestor, { from: investor, gas: 4000000 });
      logs[0].event.should.be.equal('NewUser');
      logs[1].event.should.be.equal('DeleteUser');
      logs[2].event.should.be.equal('UpdateUser');
      logs[3].event.should.be.equal('OwnershipTransferred');
      let data;
      data = await token.getUser(investor, { from: owner }).catch((e) => e);
      data.message.should.be.equal('VM Exception while processing transaction: revert');
      data = await token.getUser(otherInvestor, { from: owner });
      data[0].should.be.equal('zzzzzzzzzzAA');
      data[1].toNumber().should.be.equal(0);
      data[2].should.be.equal(await token.address);
      data[3].should.be.equal(false);
      data[4].toNumber().should.be.equal(0);
    });

    it('not allow to register null accounts', async () => {
      const token = await Token.new();
      const logs = await token.newUser('zzzzzzzzzzAA', 'pub hash', { from: null, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('invalid address');
    });
  });

  describe('companies', () => {
    it('update manager', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      await token.updateManager(investor, 'company hash 1', 'company pub 2 hash', { from: investor, gas: 1000000 });
      let data;
      data = await token.getManager(investor, { from: owner });
      data[0].should.be.equal('company hash 1');
      data[1].should.be.equal('company pub 2 hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('disallow update manager from others', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      const logs = await token.updateManager(investor, 'company hash 1', 'company pub 2 hash', { from: owner, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('disallow get manager for others', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      const logs = await token.getManager(investor, { from: otherInvestor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('allow get manager for owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      const data = await token.getManager(investor, { from: owner, gas: 1000000 });
      data[0].should.be.equal('company hash');
      data[1].should.be.equal('company pub hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('allow get manager for admins', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);
      const data = await token.getManager(investor, { from: otherInvestor, gas: 1000000 });
      data[0].should.be.equal('company hash');
      data[1].should.be.equal('company pub hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('allow get manager for users', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      const data = await token.getManager(investor, { from: investor, gas: 1000000 });
      data[0].should.be.equal('company hash');
      data[1].should.be.equal('company pub hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('allow get manager at index for admins and owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);
      let data;
      data = await token.getManagerAtIndex(0, { from: owner, gas: 1000000 });
      data[0].should.be.equal(investor);
      data[1].should.be.equal('company hash');
      data[2].should.be.equal('company pub hash');
      data[3].toNumber().should.be.equal(0);
      data = await token.getManagerAtIndex(0, { from: otherInvestor, gas: 1000000 });
      data[0].should.be.equal(investor);
      data[1].should.be.equal('company hash');
      data[2].should.be.equal('company pub hash');
      data[3].toNumber().should.be.equal(0);
    });

    it('allow get manager for admins', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);
      const data = await token.getManager(investor, { from: otherInvestor, gas: 1000000 });
      data[0].should.be.equal('company hash');
      data[1].should.be.equal('company pub hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('get manager at index, public', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      const data = await token.getManagerAtIndexPublic(0, { from: otherInvestor });
      data[0].should.be.equal(investor);
      data[1].should.be.equal('company pub hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('get correct managers count', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 1000000, value: ether(6) });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: otherInvestor, gas: 1000000, value: ether(6) });
      const cnt = await token.getManagersCount({ from: owner });
      cnt.toNumber().should.be.equal(2);
    });

    it('new manager with tokens', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.sendTransaction({ from: investor, gas: 1000000, value: ether(100) });
      await token.newManagerWithTokens('company hash', 'company pub hash', { from: investor, gas: 1000000 });
      const data = await token.getManager(investor, { from: owner });
      data[0].should.be.equal('company hash');
      data[1].should.be.equal('company pub hash');
      data[2].toNumber().should.be.equal(0);
    });

    it('delete manager', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.sendTransaction({ from: investor, gas: 1000000, value: ether(100) });
      await token.newManagerWithTokens('company hash', 'company pub hash', { from: investor, gas: 1000000 });
      const { logs } = await token.deleteManager(investor, { from: investor, gas: 1000000 });
      logs[0].event.should.be.equal('DeleteManager');
      const data = await token.getManager(investor, { from: owner }).catch((e) => e);
      data.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('set user state from owner', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(100) });
      await token.newManagerWithTokens('company hash', 'company pub hash', { from: otherInvestor, gas: 1000000 });
      await token.addToWhitelist(otherInvestor, { from: owner });
      const whitelist = await token.getWhitelistStatus(otherInvestor);
      whitelist.should.be.equal(true);
      const { logs } = await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      logs[0].event.should.be.equal('Transfer');
      const status = await token.getUserState(investor, { from: otherInvestor, gas: 1000000 });
      status[0].toNumber().should.be.equal(1);
    });

    it('get user state at index', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(100) });
      await token.newManagerWithTokens('company hash', 'company pub hash', { from: otherInvestor, gas: 1000000 });
      await token.addToWhitelist(otherInvestor, { from: owner });
      const whitelist = await token.getWhitelistStatus(otherInvestor);
      whitelist.should.be.equal(true);
      const { logs } = await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      logs[0].event.should.be.equal('Transfer');
      const status = await token.getUserStateAtIndex(0, { from: otherInvestor, gas: 1000000 });
      status[0].toNumber().should.be.equal(1);
    });

    it('set user state from admin', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: wallet, gas: 1000000 });

      // admin
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);

      // admin add manager
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 40000000, value: ether(6) });
      await token.addToWhitelist(investor, { from: otherInvestor });
      const whitelist = await token.getWhitelistStatus(investor);
      whitelist.should.be.equal(true);

      // check results
      const { logs } = await token.setUserStatus(wallet, 1, investor, { from: otherInvestor, gas: 1000000 });
      logs[0].event.should.be.equal('Transfer');
      const status = await token.getUserState(wallet, { from: investor, gas: 1000000 });
      status[0].toNumber().should.be.equal(1);
    });

    it('set multi states from admin', async () => {
      const token = await Token.new();

      // admin
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);

      // manager
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 40000000, value: ether(6) });
      await token.addToWhitelist(investor, { from: otherInvestor });
      const whitelist = await token.getWhitelistStatus(investor);
      whitelist.should.be.equal(true);

      // admin sets user
      await token.newUser('hash', 'pub hash', { from: wallet, gas: 1000000 });
      await token.setUserStatus(wallet, 1, investor, { from: otherInvestor, gas: 1000000 });
      let status;

      status = await token.getUserState(wallet, { from: investor, gas: 1000000 });
      status[0].toNumber().should.be.equal(1);

      await token.setUserStatus(wallet, 0, investor, { from: otherInvestor, gas: 1000000 });
      status = await token.getUserState(wallet, { from: investor, gas: 1000000 });
      status[0].toNumber().should.be.equal(0);
    });

    it('remove from whitelist for admins', async () => {
      const token = await Token.new();

      // admin
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.setUserRole(otherInvestor, 1, { from: owner, gas: 1000000 });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(1);

      // manager
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 40000000, value: ether(6) });
      await token.addToWhitelist(investor, { from: otherInvestor });

      let whitelist;
      whitelist = await token.getWhitelistStatus(investor);
      whitelist.should.be.equal(true);
      await token.removeFromWhitelist(investor, { from: otherInvestor });
      whitelist = await token.getWhitelistStatus(investor);
      whitelist.should.be.equal(false);
    });

    it('set information for users from managers', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: otherInvestor, gas: 40000000, value: ether(6) });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(2);
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      await token.updateRulesInfo(investor, 'information accessible for manager', { from: otherInvestor, gas: 1000000 });
      await token.addToWhitelist(otherInvestor, { from: owner });
      const status = await token.getUserState(investor, { from: otherInvestor, gas: 1000000 });
      status[1].should.be.equal('information accessible for manager');
    });

    it('disallow to set information for users from others', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: otherInvestor, gas: 40000000, value: ether(6) });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(2);
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      const logs = await token.updateRulesInfo(investor, 'information accessible for manager', { from: investor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('disallow to get user state from others', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: otherInvestor, gas: 40000000, value: ether(6) });
      const role = await token.getRole(otherInvestor, { from: owner });
      role.toNumber().should.be.equal(2);
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      await token.updateRulesInfo(investor, 'information accessible for manager', { from: otherInvestor, gas: 1000000 });
      await token.addToWhitelist(otherInvestor, { from: owner });
      let logs;
      logs = await token.getUserState(investor, { from: investor, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
      logs = await token.getUserState(investor, { from: owner, gas: 1000000 }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });
  });

  describe('refs', () => {
    it('new referral', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      const { logs } = await token.newRef({ from: investor, gas: 1000000 });
      logs[0].event.should.be.equal('NewRef');
    });

    it('delete referral', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      let cnt
      cnt = await token.getRefCount();
      cnt.toNumber().should.be.equal(0);
      await token.newRef({ from: investor, gas: 1000000 });
      cnt = await token.getRefCount();
      cnt.toNumber().should.be.equal(1);
      await token.deleteRef(investor, { from: investor, gas: 1000000 });
      cnt = await token.getRefCount();
      cnt.toNumber().should.be.equal(0);
    });

    it('new user for a referral', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.newRef({ from: otherInvestor, gas: 1000000 });
      await token.newUserByRef('from ref', 'pub from ref hash', otherInvestor, { from: investor, gas: 1000000 });
      const data = await token.getUser(investor, { from: owner });
      data[0].should.be.equal('from ref');
      data[1].toNumber().should.be.equal(0);
      data[2].should.be.equal(otherInvestor);
      data[3].should.be.equal(false);
      data[4].toNumber().should.be.equal(0);
    });

    it('multi users for a referral', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.newRef({ from: otherInvestor, gas: 1000000 });
      await token.newUserByRef('from ref', 'pub from ref hash', otherInvestor, { from: investor, gas: 1000000 });
      const { logs } = await token.newUserByRef('from ref 2', 'pub from ref hash 2', otherInvestor, { from: wallet, gas: 1000000 });
      logs[1].event.should.be.equal('NewReferred');
      let data;
      data = await token.getUser(wallet, { from: owner });
      data[0].should.be.equal('from ref 2');
      data[1].toNumber().should.be.equal(0);
      data[2].should.be.equal(otherInvestor);
      data[3].should.be.equal(false);
      data[4].toNumber().should.be.equal(0);
      await token.setUserRole(otherInvestor, 2, { from: owner, gas: 1000000 });
      data = await token.getRefUserAtIndex(0, otherInvestor, { from: otherInvestor });
      data.should.be.equal(investor);
      data = await token.getRefUserAtIndex(1, otherInvestor, { from: otherInvestor });
      data.should.be.equal(wallet);
      const cnt = await token.getRefUsersCount(otherInvestor, { from: otherInvestor });
      cnt.toNumber().should.be.equal(2);
    });
  });

  describe('pausing contract', () => {
    it('pause', async () => {
      const token = await Token.new();
      await token.pause({ from: owner });
      const logs = await token.pause({ from: owner }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });

    it('unpause', async () => {
      const token = await Token.new();
      await token.pause({ from: owner });
      await token.unpause({ from: owner });
      const logs = await token.unpause({ from: owner }).catch((e) => e);
      logs.message.should.be.equal('VM Exception while processing transaction: revert');
    });
  });

  describe('balances', () => {
    it('generates correct registration bonus', async () => {
      const token = await Token.new();
      let balance;
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('future company', 'company pub hash', { from: otherInvestor, gas: 1000000 });
      balance = await token.balanceOf(investor);
      balance.toNumber().should.be.equal(0);
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      balance = await token.balanceOf(investor);
      balance.toNumber().should.be.equal(1000);
    });

    it('generates correct referral registration bonus', async () => {
      const token = await Token.new();
      let balance;
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newRef({ from: investor, gas: 1000000 });
      await token.newUserByRef('from ref', 'pub from ref hash', investor, { from: otherInvestor, gas: 1000000 });
      await token.setUserStatus(otherInvestor, 1, investor, { from: owner, gas: 1000000 });
      await token.setUserStatus(investor, 1, investor, { from: owner, gas: 1000000 });
      balance = await token.balanceOf(investor);
      balance.toNumber().should.be.equal(1100);
      balance = await token.balanceOf(otherInvestor);
      balance.toNumber().should.be.equal(1000);
    });

    it('takes correct manager registration fee', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      const initialBalance = (await web3.eth.getBalance(investor)).toNumber() / 10 ** 18;
      await token.newManager('company hash', 'company pub hash', { from: investor, value: ether(6) });
      const finalBalance = (await web3.eth.getBalance(investor)).toNumber() / 10 ** 18;
      Math.round(finalBalance).should.be.equal(Math.round(initialBalance - 6));
      const contractBalance = (await token.balance({ from: owner })).toNumber() / 10 ** 18;
      Math.round(contractBalance).should.be.equal(6);
      const initialOwnerBalance = (await web3.eth.getBalance(owner)).toNumber() / 10 ** 18;
      await token.withdraw({ from: owner });
      const finalOwnerBalance = (await web3.eth.getBalance(owner)).toNumber() / 10 ** 18;
      Math.round(finalOwnerBalance).should.be.equal(Math.round(initialOwnerBalance) + 6);
    });

    it('takes correct manager registration fee in tokens', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.sendTransaction({ from: investor, gas: 1000000, value: ether(100) });
      const initialBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      await token.newManagerWithTokens('company hash', 'company pub hash', { from: investor, gas: 1000000 });
      const finalBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      Math.round(finalBalance).should.be.equal(Math.round(initialBalance) - 60000);
    });

    it('prevent multi bonuses', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      const balance = await token.balanceOf(investor);
      balance.toNumber().should.be.equal(1000);
    });

    it('prevent multi referral bonuses', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 1000000 });
      await token.newRef({ from: investor, gas: 1000000 });
      await token.newUserByRef('from ref', 'pub from ref hash', investor, { from: otherInvestor, gas: 1000000 });
      await token.setUserStatus(otherInvestor, 1, investor, { from: owner, gas: 1000000 });
      await token.setUserStatus(otherInvestor, 1, investor, { from: owner, gas: 1000000 });
      await token.setUserStatus(otherInvestor, 1, investor, { from: owner, gas: 1000000 });
      const balance = await token.balanceOf(investor);
      balance.toNumber().should.be.equal(100);
    });

    it('set multi states', async () => {
      const token = await Token.new();
      await token.newUser('hash investor', 'pub hash', { from: investor, gas: 1000000 });
      await token.newUser('hash wallet', 'pub hash', { from: wallet, gas: 1000000 });
      await token.newUser('hash wallet', 'pub hash', { from: otherInvestor, gas: 1000000 });
      await token.newManager('company hash', 'company pub hash', { from: investor, gas: 40000000, value: ether(6) });
      await token.newManager('company hash', 'company pub hash', { from: wallet, gas: 40000000, value: ether(6) });
      await token.newManager('company hash', 'company pub hash', { from: otherInvestor, gas: 40000000, value: ether(6) });
      await token.addToWhitelist(otherInvestor, { from: owner });
      await token.addToWhitelist(wallet, { from: owner });
      await token.addToWhitelist(investor, { from: owner });
      await token.setUserStatus(investor, 1, otherInvestor, { from: owner, gas: 1000000 });
      await token.setUserStatus(investor, 2, wallet, { from: owner, gas: 1000000 });
      await token.setUserStatus(investor, 0, investor, { from: owner, gas: 1000000 });
      let status;
      status = await token.getUserState(investor, { from: otherInvestor, gas: 1000000 });
      status[0].toNumber().should.be.equal(1);
      status = await token.getUserState(investor, { from: wallet, gas: 1000000 });
      status[0].toNumber().should.be.equal(2);
      status = await token.getUserState(investor, { from: investor, gas: 1000000 });
      status[0].toNumber().should.be.equal(0);
    });

    it('returns correct total supply after purchase', async () => {
      const token = await Token.new();
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(1) });
      const rate = await token.rate();
      const expected = ether(1).mul(rate);
      const supply = await token.totalSupply();
      supply.toNumber().should.be.equal(expected.toNumber());
    });

    it('returns correct amounts after team set', async () => {
      const token = await Token.new();
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(1) });
      const rate = await token.rate();
      await token.setTeamTokens(ether(0.2).mul(rate), { from: owner })
      const expected = ether(1.2).mul(rate);
      const supply = await token.totalSupply();
      supply.toNumber().should.be.equal(expected.toNumber());
      const balance = await token.balanceOf(owner);
      balance.toNumber().should.be.equal(ether(0.2).mul(rate).toNumber());
    });

    it('returns correct amounts after burn', async () => {
      const token = await Token.new();
      await token.sendTransaction({ from: otherInvestor, gas: 1000000, value: ether(1) });
      const rate = await token.rate();
      await token.setTeamTokens(ether(0.2).mul(rate), { from: owner })
      await token.burn(ether(0.1).mul(rate), { from: owner })
      const expected = ether(1.1).mul(rate);
      const supply = await token.totalSupply();
      supply.toNumber().should.be.equal(expected.toNumber());
      const balance = await token.balanceOf(owner);
      balance.toNumber().should.be.equal(ether(0.1).mul(rate).toNumber());
    });

    it('returns approval fee after disapproval', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 10000000 });
      await token.sendTransaction({ from: investor, gas: 60000000, value: ether(100) });
      const initialOwnerBalance = (await token.balanceOf(investor, { from: investor })).toNumber() / 10 ** 18;
      Math.round(initialOwnerBalance).should.be.equal(100000);
      await token.newManagerWithTokens('company hash', 'company pub hash', { from: investor, gas: 1000000 });
      let totalSupply;
      totalSupply = await token.totalSupply();
      (totalSupply.toNumber() / 10 ** 18).should.be.equal(40000);
      const interBalance = await token.balanceOf(investor);
      (interBalance.toNumber() / 10 ** 18).should.be.equal(40000);

      await token.addToWhitelist(investor, { from: owner });
      await token.removeFromWhitelist(investor, { from: owner });
      const finalBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      finalBalance.should.be.equal(90000);
      totalSupply = await token.totalSupply();
      (totalSupply.toNumber() / 10 ** 18).should.be.equal(90000);
    });

    it('burns for upvotng users', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 10000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 10000000 });
      await token.sendTransaction({ from: investor, gas: 60000000, value: ether(100) });
      const initialBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      await token.upVoteUser(otherInvestor, { from: investor, gas: 1000000 });
      const finalBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      const expected = initialBalance - (await token.voteFeeTokens() / 10 ** 18);
      Math.round(finalBalance).should.be.equal(Math.round(expected));
      const totalSupply = await token.totalSupply();
      Math.round(totalSupply.toNumber() / 10 ** 18).should.be.equal(Math.round(expected));
    });

    it('burns for downvotng users', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 10000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 10000000 });
      await token.sendTransaction({ from: investor, gas: 60000000, value: ether(100) });
      const initialBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      await token.upVoteUser(otherInvestor, { from: investor, gas: 1000000 });
      await token.downVoteUser(otherInvestor, { from: investor, gas: 1000000 });
      const finalBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      const expected = initialBalance - (await token.voteFeeTokens() * 2 / 10 ** 18);
      Math.round(finalBalance).should.be.equal(Math.round(expected));
      const totalSupply = await token.totalSupply();
      Math.round(totalSupply.toNumber() / 10 ** 18).should.be.equal(Math.round(expected));
    });

    it('burns for upvotng managers', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 10000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 10000000 });
      await token.newManager('company hash', 'company pub hash', { from: otherInvestor, gas: 40000000, value: ether(6) });
      await token.sendTransaction({ from: investor, gas: 60000000, value: ether(100) });
      const initialBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      await token.upVoteManager(otherInvestor, { from: investor, gas: 1000000 });
      const finalBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      const expected = initialBalance - (await token.voteFeeTokens() / 10 ** 18);
      Math.round(finalBalance).should.be.equal(Math.round(expected));
      const totalSupply = await token.totalSupply();
      Math.round(totalSupply.toNumber() / 10 ** 18).should.be.equal(Math.round(expected));
    });

    it('burns for downvotng managers', async () => {
      const token = await Token.new();
      await token.newUser('hash', 'pub hash', { from: investor, gas: 10000000 });
      await token.newUser('hash', 'pub hash', { from: otherInvestor, gas: 10000000 });
      await token.newManager('company hash', 'company pub hash', { from: otherInvestor, gas: 40000000, value: ether(6) });
      await token.sendTransaction({ from: investor, gas: 60000000, value: ether(100) });
      const initialBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      await token.upVoteManager(otherInvestor, { from: investor, gas: 1000000 });
      await token.downVoteManager(otherInvestor, { from: investor, gas: 1000000 });
      const finalBalance = (await token.balanceOf(investor)).toNumber() / 10 ** 18;
      const expected = initialBalance - (await token.voteFeeTokens() * 2 / 10 ** 18);
      Math.round(finalBalance).should.be.equal(Math.round(expected));
      const totalSupply = await token.totalSupply();
      Math.round(totalSupply.toNumber() / 10 ** 18).should.be.equal(Math.round(expected));
    });
  });
});
