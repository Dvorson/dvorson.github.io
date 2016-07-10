import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
//import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Main from './Main';

injectTapEventPlugin();

ReactDOM.render(
		<Main />, 
	document.getElementsByClassName('app')[0]);
