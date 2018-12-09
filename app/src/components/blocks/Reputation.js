import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

class Reputation extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      reputation: ''
    }
  }

  componentDidMount = async () => {
    this.getRep()
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    await this.getRep()
  }

  getRep = async() => {
    if (this.props.rep !== '' && this.props.rep !== null && this.mounted) {
      this.props.Token.deployed().then(async (token) => {
        token[this.props.rep]().then((res) => {
          this.setState({
            reputation: res ? res.toNumber() : 'N/A'
          })
        })
      })
    }

    setTimeout(() => {
      this.getRep()
    }, 2000)
  }

  render() {
    return <strong>{ this.state.reputation }</strong>
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token
  }
}

export default connect(mapStateToProps)(Reputation)
