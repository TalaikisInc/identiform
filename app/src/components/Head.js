import React from 'react'
import { Helmet } from 'react-helmet'

const Head = (props) => (
  <Helmet>
    <meta charSet='utf-8' />
    <title>{props.title} | identiForm</title>
  </Helmet>
)

export default Head
