import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
//import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MainCard from './MainCard';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';

injectTapEventPlugin();

ReactDOM.render(
	<Grid>
    	<Row>
        	<Col xs={12} md={4} lg={3}>
        		<MainCard />
        	</Col>
        </Row>
    </Grid>, 
	document.getElementsByClassName('app')[0]);
