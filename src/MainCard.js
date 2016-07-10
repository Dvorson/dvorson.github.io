import React from 'react';
import baseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';


class MainCard extends React.Component {
  getChildContext() {
    return {muiTheme: getMuiTheme(baseTheme)};
  }

  render () {
    return <Card>
    <CardMedia
      overlay={<CardTitle title="Anton Dvorson" subtitle="Web Developer" />}
    >
      <img src="/build/img/multipassport.jpg" />
    </CardMedia>
    <CardText>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </CardText>
    <CardActions>
      <FlatButton label="GitHub" />
      <FlatButton label="Vk" />
    </CardActions>
  </Card>;
  }
}

MainCard.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export default MainCard;