import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'

const styles = theme => ({
  img: {
    width: '100%',
    maxWidth: '375px'
  },
  imgBlack: {
    background: 'black',
    padding: theme.spacing.unit,
    maxWidth: '375px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 100
  },
  company: {
    fontSize: '2.5rem',
    lineHeight: '2.5rem'
  },
  desc: {
    fontSize: '1.2rem'
  },
  content: {
    padding: `0 ${theme.spacing.unit}px 0 0`
  }
})

class Experience extends Component {
  render () {
    const { classes } = this.props
    return (
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Grid container spacing={0}>
            <Grid item xs={12} sm={3}>
              <Typography type="title">August 2017 - Currently</Typography>
              <img className={classes.img} src="client/img/fls-logo.svg" alt="FirstLine Software" />
              <img className={classes.imgBlack} src="client/img/bonnier.svg" alt="Bonnier News" />
            </Grid>
            <Grid item xs={12} sm={9}>
              <CardContent className={classes.content}>
                <Typography className={classes.company} type="headline">FirstLine Software</Typography>
                <Typography className={classes.title} type="subheading" color="secondary">
                  Programmer
                </Typography>
                <Typography className={classes.desc}>
                  Developing internal analytics and editorial tools for Bonnier News - news publisher from Sweden.
                  Gathering and visualising editorial analytics from complex infrastructure. Implementing EPiServer CMS functionality by means
                  of node.js and React to help editors move to a synced multi-user workflow. Managing deployment
                  infrastructure, moving development process into Kubernetes-based service.
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12} sm={3}>
              <Typography type="title">March 2016 - July 2017</Typography>
              <img className={classes.img} src="client/img/yamoney.svg" alt="Yandex.Money" />
            </Grid>
            <Grid item xs={12} sm={9}>
              <CardContent className={classes.content}>
                <Typography className={classes.company} type="headline">Yandex.Money</Typography>
                <Typography className={classes.title} type="subheading" color="secondary">
                  Programmer
                </Typography>
                <Typography className={classes.desc}>
                  Implemented new functionality for
                  <a href="money.yandex.ru">money.yandex.ru</a>
                  by means of Yandex internal web-components
                  framework (fullstack BEM): redesign, payment
                  processes logic in node.js, client business logic, search interface,
                  asynchronous form validation, A/B testing.
                  Developed BEM stack tools, participated in hackathons
                  within the company: developed assembly tools for front-end
                  blocks with gulp, webpack, enb, templating with bem-xjst engine
                  Administrating Linux: Supporting Different Components of
                  Project Environment
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12} sm={3}>
              <Typography type="title">July 2013 - March 2016</Typography>
              <img className={classes.img} src="client/img/smart3d.png" alt="Smart3d" />
            </Grid>
            <Grid item xs={12} sm={9}>
              <CardContent className={classes.content}>
                <Typography className={classes.company} type="headline">Measure LLC</Typography>
                <Typography className={classes.title} type="subheading" color="secondary">
                  CTO
                </Typography>
                <Typography className={classes.desc}>
                  Developed a web application from scratch to support business processes:
                  parsing 3d models clientside to calculate volume and production costs,
                  visualising models in the browser with three.js, production order formation,
                  preparation of reports, websocket messaging system for managers and customers.
                  Online store with filtering by multiple criteria without additional
                  requests to backend. Shopping cart. Clientside templates,
                  REST API, vk API, mailing list, blog. MongoDB, persistent cookies
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

Experience.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Experience)
