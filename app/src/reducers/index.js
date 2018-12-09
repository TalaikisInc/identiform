import { combineReducers } from 'redux'

import Web3 from './web3'
import Token from './token'
import Account from './account'
import IPFS from './ipfs'
import Gas from './gas'
import Registered from './registered'
import Manager from './manager'
import Referral from './referral'

const root = combineReducers({
  web3: Web3,
  Token: Token,
  ipfs: IPFS,
  account: Account,
  gasPrice: Gas,
  registered: Registered,
  registeredAsManager: Manager,
  registeredAsRef: Referral
})

export default root
