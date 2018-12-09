import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

class Fees extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      fee: '',
      decimals: null
    }

    this.getRate = this.getRate.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
  }

  componentDidMount = async () => {
    await this.getDecimals()
    await this.getRate()
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  getDecimals = async () => {
    this.props.Token.deployed().then((token) => {
      token.decimals.call().then((res) => {
        if (this.mounted) {
          this.setState({
            decimals: res ? res.toNumber() : null
          })
        }
      })
    })

    setTimeout(() => {
      this.getDecimals()
    }, 2000)
  }

  getRate = async () => {
    if (this.props.fee !== '') {
      if (this.mounted && this.state.decimals) {
        this.props.Token.deployed().then(async (token) => {
          token[this.props.fee]().then((res) => {
            if (this.props.ether) {
              this.setState({ fee: res ? res.toNumber() / 10 ** this.state.decimals : null })
            } else {
              this.setState({ fee: res ? res.toNumber() / 10 ** this.state.decimals : null })
            }
          })
        })
      }
    }

    setTimeout(() => {
      this.getRate()
    }, 2000)
  }

  render() {
    return <strong>{ this.state.fee ? this.state.fee : null }</strong>
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token
  }
}

export default connect(mapStateToProps)(Fees)
