import decrypt from 'utils/decrypt'

const getData = async (account, _data, setState) => {
  const j = JSON.parse(_data[0].content.toString('ascii')).data
  const _obj = await decrypt(account, j)
  if (_obj) {
    setState({
      user: account,
      data: JSON.parse(_obj.data),
      loaded: true
    })
  }
}

export default getData
