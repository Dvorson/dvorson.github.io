import React, { Component } from 'react'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const FontIcon = props => <Icon {...props} />

const styles = theme => ({
  social: {
    flexWrap: 'wrap',
    height: 'initial',
    color: theme.palette.primary
  },
  image: {
    width: '100%',
    maxWidth: '375px'
  },
  name: {
    fontSize: '1.7rem',
    lineHeight: '1.7rem'
  },
  title: {
    fontWeight: 100,
    fontSize: '1rem'
  }
})

class AvatarCard extends Component {
  render () {
    const classes = this.props.classes
    return (
      <Card className={classes.card}>
        <CardMedia>
          <img className={classes.image} src="img/multipassport.jpg" alt="Profile image"/>
        </CardMedia>
        <CardContent>
          <Typography className={classes.name} type="headline">Anton Dvorson</Typography>
          <Typography className={classes.title} type="subheading">Fullstack web developer</Typography>
        </CardContent>
        <CardActions className={classes.social}>
          <IconButton href="https://github.com/Dvorson">
            <FontIcon className="fa fa-github"/>
          </IconButton>
          <IconButton href="https://vk.com/dvorson">
            <FontIcon className="fa fa-vk"/>
          </IconButton>
          <IconButton href="https://t.me/dvorson">
            <FontIcon className="fa fa-telegram"/>
          </IconButton>
          <IconButton href="https://www.instagram.com/dvorson/">
            <FontIcon className="fa fa-instagram"/>
          </IconButton>
          <IconButton href="https://ru.linkedin.com/in/антон-дворсон-b4ba7357">
            <FontIcon className="fa fa-linkedin-square"/>
          </IconButton>
          <IconButton href="https://medium.com/@dvorson">
            <FontIcon className="fa fa-medium"/>
          </IconButton>
        </CardActions>
      </Card>
    )
  }
}

AvatarCard.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(AvatarCard)
