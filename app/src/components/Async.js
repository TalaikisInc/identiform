import React, { Component } from 'react'

import Spinning from 'grommet/components/icons/Spinning'

export default function Async(imported) {
  /* eslint-disable no-shadow */
  class Async extends Component {
    constructor(props) {
      super(props)

      this.state = {
        component: null
      }
    }

    async componentDidMount() {
      const { default: component } = await imported()

      this.setState({
        component: component
      })
    }

    render() {
      const C = this.state.component

      return C ? <C {...this.props} /> : <Spinning size='medium' />
    }
  }

  return Async
}
