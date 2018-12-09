<p align="center">
  <a href="https://identiform.com/">
    <img alt="identiForm" src="https://github.com/Identiform/token_sale_starter/blob/master/media/logo.png" width="683">
  </a>
</p>

# [identiForm](https://app.identiform.com/)

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Dependency Status](https://david-dm.org/identiform/identiform.svg)](https://david-dm.org/identiform/identiform)
[![devDependency Status](https://david-dm.org/identiform/identiform/dev-status.svg)](https://david-dm.org/identiform/identiform/?type=dev)
[![Build Status](https://travis-ci.org/Identiform/identiform.svg?branch=master)](https://travis-ci.org/Identiform/identiform)

## About

identiForm is transparent, easy to use, secure, fully decentralized Web 3.0 B2B KYC/ AML platform. Anyone can register and receive free tokens!

* Easy to start for businesses - just register your firm, await for our approval and send your users to our contract, our AI will review them depending on your set rules.</li>
* Simple query based payment structure - just call our contract from your own ICO contract for a small fee and you'll get answer if customer is compliant or not.
* Simple for users - if they have already registered, their data will load automatically. One registration now means access anything on the network!
* Users would thank you for using our service, because they are incentivized.
* Savings on KYC/ AML process - you don't need to hire staff to verify all the legal requirements and users' documents.

## How to connect your contract

...

## Installation

Nore, app moved to [platform](https://github.com/Identiform/platform) repository.

```
npm i -g truffle
npm i
cd app
npm i
```

## How to run locally

```
npm run rpc
truffle compile --network development
truffle migraye --network development --reset
npm run copy
cd app
npm start
```

## Test

```
npm run rpc
truffle test
```

## How to get user legal status for your contract

Implement the following:

```
import "./interfaces/IDentiForm.sol";

IDentiForm idfContract;
idfContract = IDentiForm('TO_BE_ADDED');
```

Then:

```
idfContract.getUserState(userAddress)
```

will return user statsu for your company, 0 - waiting, 1 - approved, 2 - disapproved.

Requests can only be made from registered and approved address.

## Documentation

[Contract reference](https://github.com/Identiform/docs), for additional information - see .sol files.
