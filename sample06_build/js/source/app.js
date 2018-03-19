'use strict';

/**
 * メイン処理
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Logo from './component/Logo';

ReactDOM.render(
  <h1>
    <Logo />
  </h1>,
  document.getElementById('app')
);