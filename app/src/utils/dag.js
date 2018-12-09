const dag = async (token, _ipfsCom, _tokenCom, _data, props, msg, _fee) => {
  props.ipfs.dag[_ipfsCom](_data, { format: 'dag-cbor', hashAlg: 'sha2-256' }, async (error, cid) => {
    if (error) {
      msg(0, error)
    } else {
      const _cidBase = cid.toBaseEncodedString()

      let options = { from: props.account }
      let _args = [props.account, _cidBase]
      if (_fee) {
        options = { from: props.account, value: _fee, to: token.address }
        _args = [_cidBase]
      }

      const args = Array.prototype.slice.call(_args)

      let _gas = await token[_tokenCom].estimateGas(args, options)

      if (_fee) {
        _gas += 50000
      }

      token[_tokenCom](_cidBase, Object.assign({ gas: _gas, gasPrice: props.gasPrice }, options)).then((receipt) => {
        msg(1, receipt)
      }).catch((err) => {
        msg(0, err)
      })
    }
  })
}

export default dag
