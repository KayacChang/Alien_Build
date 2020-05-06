import {sprites} from './sprites';
import {symbols, symbolConfig} from './symbols';
import {sounds} from './sound';

import SCORE_URL from '../assets/fonts/score.xml';
import '../assets/fonts/score.png';

import BIGWIN_URL from '../assets/fonts/bigwin.xml';
import '../assets/fonts/bigwin.png';


export function reserve() {
    return [
        ...(sprites),
        ...(symbols),
        ...(sounds),

        {name: 'Score', url: SCORE_URL},
        {name: 'BigWin', url: BIGWIN_URL},
    ];
}


const stopPerSymbol = 2;

const MAYBE_BONUS_DURATION = 1000;
const getSpinDuration = () => [2100, 1800, 900][app.user.speed];
const getSpinStopInterval = () => [360, 300, 180][app.user.speed];

export {
    stopPerSymbol,

    symbolConfig,

    MAYBE_BONUS_DURATION,
    getSpinStopInterval,
    getSpinDuration,

};

