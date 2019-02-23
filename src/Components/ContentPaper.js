import React, { Component } from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Skills from './Skills'
import Experience from './Experience'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    pageBreakBefore: 'always'
  },
  section: {
    fontSize: '2.5rem'
  }
})

class ContentPaper extends Component {
  render () {
    const { classes } = this.props
    return (
      <Paper className={classes.paper}>
        <Grid container className={classes.root} spacing={16}>
          <Grid item xs={12}>
            <Typography className={classes.section} type="headline">Skills</Typography>
            <hr />
            <Skills />
          </Grid>
          <Grid item xs={12}>
            <Typography className={classes.section} type="headline">Experience</Typography>
            <hr />
            <Experience />
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

ContentPaper.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ContentPaper)
