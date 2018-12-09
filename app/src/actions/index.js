import contract from 'truffle-contract'
import ipfsAPI from 'ipfs-api'

import TokenArtifact from '../contracts/Factory.json'

export function initWeb3() {
  const { web3 } = window
  const { Web3 } = window

  if (typeof Web3 !== 'undefined') {
    let provider
    if (typeof web3 !== 'undefined') {
      provider = web3.currentProvider
    } else {
      provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
    }

    const web3Initiated = new Web3(provider)

    return {
      type: 'INIT_WEB3',
      payload: {
        web3Initiated,
        web3,
        provider
      }
    }
  }

  return {
    type: 'INIT_WEB3',
    payload: {
      web3Initiated: null,
      web3InitiatedLocal: null,
      web3: null,
      provider: null
    }
  }
}

export function initIPFS(payload) {
  const ipfs = ipfsAPI('gate.powerpiper.com', '5005', { protocol: 'https' })

  return {
    type: 'INIT_IPFS',
    payload: ipfs
  }
}

export function initToken(payload) {
  const instance = contract(TokenArtifact)

  if (payload.provider) {
    instance.setProvider(payload.provider)
  }

  return {
    type: 'INIT_TOKEN',
    payload: instance
  }
}

export function fetchAccount(payload) {
  return (dispatch) => {
    if (payload.web3) {
      payload.web3.eth.getCoinbase((err, account) => {
        if (err === null) {
          dispatch({
            type: 'FETCH_ACCOUNT',
            payload: (account !== null ? account : 'empty')
          })
        } else {
          dispatch({
            type: 'FETCH_ACCOUNT',
            payload: null
          })
        }
      })
    } else {
      dispatch({
        type: 'FETCH_ACCOUNT',
        payload: null
      })
    }
  }
}

export function isRegistered(payload) {
  return (dispatch) => {
    if (payload.Token && payload.account !== null && payload.account !== 'empty') {
      payload.Token.deployed().then(async (token) => {
        token.existsUser(payload.account, { from: payload.account })
          .then(async (registered) => {
            if (registered) {
              dispatch({
                type: 'IS_REGISTERED',
                payload: registered
              })
            } else {
              dispatch({
                type: 'IS_REGISTERED',
                payload: null
              })
            }
          })
      })
    } else {
      dispatch({
        type: 'IS_REGISTERED',
        payload: null
      })
    }
  }
}

export function isRegisteredAsManager(payload) {
  return (dispatch) => {
    if (payload.Token && payload.account !== null && payload.account !== 'empty') {
      payload.Token.deployed().then(async (token) => {
        token.existsManager(payload.account, { from: payload.account })
          .then(async (registered) => {
            if (registered) {
              dispatch({
                type: 'IS_REGISTERED_MANAGER',
                payload: registered
              })
            } else {
              dispatch({
                type: 'IS_REGISTERED_MANAGER',
                payload: null
              })
            }
          })
      })
    } else {
      dispatch({
        type: 'IS_REGISTERED_MANAGER',
        payload: null
      })
    }
  }
}

export function isRegisteredAsReferral(payload) {
  return (dispatch) => {
    if (payload.Token && payload.account !== null && payload.account !== 'empty') {
      payload.Token.deployed().then(async (token) => {
        token.existsRef(payload.account, { from: payload.account })
          .then(async (registered) => {
            if (registered) {
              dispatch({
                type: 'IS_REGISTERED_REFERRAL',
                payload: registered
              })
            } else {
              dispatch({
                type: 'IS_REGISTERED_REFERRAL',
                payload: null
              })
            }
          })
      })
    } else {
      dispatch({
        type: 'IS_REGISTERED_REFERRAL',
        payload: null
      })
    }
  }
}

export function fetchGasPrice(payload) {
  return (dispatch) => {
    if (payload.web3) {
      payload.web3.eth.getGasPrice(async (err, gasPrice) => {
        if (err === null) {
          dispatch({
            type: 'FETCH_GAS',
            payload: (gasPrice !== null && payload.web3.fromWei(gasPrice, 'gwei') > 0.1 ? gasPrice : payload.web3.toWei(0.1, 'gwei'))
          })
        } else {
          dispatch({
            type: 'FETCH_GAS',
            payload: null
          })
        }
      })
    } else {
      dispatch({
        type: 'FETCH_GAS',
        payload: null
      })
    }
  }
}
