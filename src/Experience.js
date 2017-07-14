import React, { Component } from 'react';
import Typography from 'material-ui/Typography';
import { withStyles, createStyleSheet } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Card, {CardContent} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';

const styleSheet = createStyleSheet('Experience', {
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  details: {
    display: 'flex',
    flexDirection: 'column'
  },
  img: {
      width: '126px',
      alignSelf: 'center'
  }
});

class Experience extends Component {
    render() {
        const classes = this.props.classes;
        return (
            <div>
            <Typography type="title">March 2016 - July 2017</Typography>
            <div className={classes.row}>
              <img src="/img/yamoney.svg" alt="Yandex.Money" />
              <CardContent className={classes.content}>
                <Typography type="headline">Yandex.Money</Typography>
                <Typography type="subheading" color="secondary">
                  programmer
                </Typography>
                <Typography>
                    { `Development and implementation of new functionality of 
                    money.yandex.ru by means of Yandex internal web-components framework - full stack BEM: redesign, logic of payment 
                    processes in node.js, client business logic, search interface, asynchronous form validation, A/B testing
                    Development of BEM stack tools, participation in hackathons within the company: 
                    assembling front-end blocks with gulp, webpack, enb, template on bem-xjst engine
                    Administrating Linux: Supporting Different Components of Project Environment` }
                </Typography>
              </CardContent>
            </div>
            <Typography type="title">July 2013 - Currently</Typography>
            <div className={classes.row}>
              <img className={classes.img} src="/img/smart3d.png" alt="Smart3d" />
              <CardContent className={classes.content}>
                <Typography type="headline">Measure LLC</Typography>
                <Typography type="subheading" color="secondary">
                  CTO
                </Typography>
                <Typography>
                    { `Development from scratch of web application to support business processes: parsing 3d models clientside to calculate volume and production costs,
visualising models in the browser with three.js, production order formation, preparation of reports, websocket messaging system for managers and customers. Online store with filtering by multiple criteria without additional requests to the backend. Shopping cart. Clientside templates, REST API, vk API, mailing list, blog. DB - MongoDB, MySQL, lowdb, persistent cookie` }
                </Typography>
              </CardContent>
            </div>
            </div>
        );
    }
}

Experience.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(Experience);
