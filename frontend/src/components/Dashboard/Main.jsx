import React from 'react';
import {css} from 'glamor';

import Logins from './Main/Logins.jsx';
import Carousel from './Main/Carousel.jsx';

const constants = require('../../js/constants');
const styles = {
    main: css({
        backgroundColor: constants.colors.background,
        minHeight: '100vh',
        height: '100%',
        width: 'calc(100% - 200px)',
        '@media(max-width: 760px)': {
            width: '100%',
            minHeight: 'calc(100% - 75px)',
            height: 'auto',
            position: 'absolute',
            top: '75px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }
    })
};

const Main = ({host, topTracks}) => (
    <main className={`${styles.main}`}>
        <Logins host={host}/>
        <Carousel topTracks={topTracks}/>
    </main>
)

export default Main;
