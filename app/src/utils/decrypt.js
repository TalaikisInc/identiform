import { post } from 'utils/api'

const decrypt = async (account, text) => {
  const body = {
    pathname: process.env.REACT_APP_PATHNAME,
    user: account,
    text
  }
  const res = await post('KEYS_DECRYPT_ECDH', body)
  return res
}

export default decrypt
