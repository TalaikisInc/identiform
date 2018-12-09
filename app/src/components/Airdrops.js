import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Button from 'grommet/components/Button'
import Table from 'grommet/components/Table'
import TableRow from 'grommet/components/TableRow'
import Paragraph from 'grommet/components/Paragraph'
import Anchor from 'grommet/components/Anchor'
import TableHeader from 'grommet/components/TableHeader'
import MoreIcon from 'grommet/components/icons/base/More'
import TargetIcon from 'grommet/components/icons/base/Target'

import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))

class Airdrops extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      success: '',
      failure: ''
    }
  }

  render() {
    return (
      <Box align='center'>
        <Heading>Airdrops</Heading>
        <Paragraph>
            This page will list airdrops you will be able to join with one click.
        </Paragraph>
        <Table>
          <TableHeader labels={['', 'Name', 'Description', 'Starting', 'Ending', 'Links', 'Rating', 'Join']} sortIndex={0} sortAscending={true} />
          <tbody>
            <TableRow>
              <td>
                <TargetIcon />
              </td>
              <td>
                <Link to='/not_implemented'>Example airdrop</Link>
              </td>
              <td>
                Participate in once in lifetime revolution.
              </td>
              <td>
                2018/05/01
              </td>
              <td>
                2018/06/01
              </td>
              <td>
                <Anchor href='/join_airdrop' icon={<MoreIcon />} />
              </td>
              <td>
                5/5
              </td>
              <td>
                { !this.props.registered ? <Link to='/register'><Anchor label='Register first' /></Link>
                  : <Link to='/join_airdrop'><Button label='Join' /></Link>
                }
              </td>
            </TableRow>
          </tbody>
        </Table>
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token,
    account: state.account,
    web3: state.web3,
    ipfs: state.ipfs,
    gasPrice: state.gasPrice,
    registered: state.registered
  }
}

export default connect(mapStateToProps)(Airdrops)
