import React, { Component } from 'react';
import Card, {CardMedia, CardContent, CardActions} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';
import { withStyles, createStyleSheet } from 'material-ui/styles';
import PropTypes from 'prop-types';

const FontIcon = props => <Icon {...props} />;

const styleSheet = createStyleSheet('Avatar', theme => ({
  card: {
      maxWidth: '356px'
  },
  social: {
      flexWrap: 'wrap',
      height: 'initial'
  },
  image: {
      maxWidth: '100%'
  }
}));

class AvatarCard extends Component {
    render() {
        const classes = this.props.classes;
        return (
            <Card className={classes.card}>
                <CardMedia>
                    <img className={classes.image} src="img/multipassport.jpg" alt="" />
                </CardMedia>
                <CardContent>
                    <Typography type="headline">Anton Dvorson</Typography> 
                    <Typography type="subheading" color="secondary">Fullstack web developer</Typography>
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
        );
    }
}

AvatarCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(AvatarCard);
