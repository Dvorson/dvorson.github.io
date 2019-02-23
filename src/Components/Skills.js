import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'

const styles = theme => ({
  chip: {
    margin: `${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit}px 0`,
    fontSize: '1.2rem'
  }
})

class Skills extends Component {
  state = {
    chipData: [
      { key: 0, label: 'Node.js' },
      { key: 1, label: 'Fullstack BEM' },
      { key: 2, label: 'React' },
      { key: 3, label: 'Gulp' },
      { key: 4, label: 'Webpack' },
      { key: 5, label: 'MongoDB' },
      { key: 6, label: 'Linux' },
      { key: 7, label: 'Lodash' },
      { key: 8, label: 'Kubernetes' },
      { key: 9, label: 'Elasticsearch' }
    ]
  };

  styles = {
    chip: {
      margin: 4
    },
    wrapper: {
      display: 'flex',
      flexWrap: 'wrap'
    }
  };

  render () {
    const { classes } = this.props

    return (
      <div className={classes.row}>
        {this.state.chipData.map(data => {
          return (
            <Chip
              label={data.label}
              key={data.key}
              className={classes.chip}
            />
          )
        })}
      </div>
    )
  }
}

Skills.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Skills)
