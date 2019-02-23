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
    chipLabels: [
      'Node.js',
      'React',
      'Redux',
      'Lodash',
      'Webpack',
      'MongoDB',
      'Unix administration',
      'Git',
      'Kubernetes',
      'Elasticsearch',
      'Fullstack BEM'
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
    const { chipLabels } = this.state

    return (
      <div className={classes.row}>
        {chipLabels.map((label, i) => {
          return (
            <Chip
              label={label}
              key={i}
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
