import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import AvatarCard from '../Components/AvatarCard'
import ContentPaper from '../Components/ContentPaper'
import withRoot from '../withRoot'

const styles = theme => ({
  container: {
    padding: theme.spacing.unit
  },
  avatar: {
    padding: theme.spacing.unit
  }
})

const App = (classes) => (
  <Grid container className={classes.container} justify="center" spacing={0}>
    <Grid className={classes.avatar} item xs={12} sm={2} spacing={4}>
      <AvatarCard />
    </Grid>
    <Grid item xs={12} sm={10}>
      <ContentPaper />
    </Grid>
  </Grid>
)

export default withRoot(withStyles(styles)(App))
