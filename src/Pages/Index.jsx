import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import AvatarCard from '../Components/AvatarCard'
import ContentPaper from '../Components/ContentPaper'
import withRoot from '../withRoot'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  avatar: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing.unit,
      backgroundColor: 'blue'
    },
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing.unit,
      backgroundColor: 'red'
    }
  }
})

const App = (classes) => (
  <Grid container justify="center" spacing={8}>
    <Grid className={classes.avatar} item xs={12} sm={2}>
      <AvatarCard />
    </Grid>
    <Grid item xs={12} sm={10}>
      <ContentPaper />
    </Grid>
  </Grid>
)

export default withRoot(withStyles(styles)(App))
