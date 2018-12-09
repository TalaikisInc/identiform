import ip from 'ip'
import fetch from 'whatwg-fetch'

export async function getTruth() {
  const _ip = ip.address()
  if (_ip) {
    const _api = `https://json.geoiplookup.io/${_ip}`
    fetch(_api)
      .then((res) => {
        return res.text()
      })
  }
}
