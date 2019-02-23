import React from 'react'
import ReactDOM from 'react-dom'
import Index from './Pages/Index.jsx'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(<Index />, document.getElementById('app'))

serviceWorker.unregister()
