import {clone} from '@kayac/utils';

export function Service(url) {
    const accountBalance = {};

    let gametypeid = undefined;

    const token = getToken();

    return {
        init,
        sendOneRound,

        get currencies() {
            return currencies;
        },

        get accountBalance() {
            return clone(accountBalance);
        },
    };

    function getToken() {
        const token =
            new URL(location).searchParams.get('token') ||
            localStorage.getItem('token');

        if (!token) {
            throw new Error(`User Access Tokens is empty`);
        }

        const homeURL =
            new URL(location).searchParams.get('lobby') ||
            localStorage.getItem('lobby');

        history.pushState(
            undefined,
            undefined,
            location.origin + location.pathname,
        );

        global.addEventListener('popstate', () => history.back());

        if (homeURL) localStorage.setItem('lobby', homeURL);
        localStorage.setItem('token', token);

        return token;
    }

    async function init() {
        const res = await fetch(url + '/game/init', {
            method: 'POST',
            headers: new Headers({
                Authorization: 'Bearer ' + token,
            }),
        });

        const {data, error} = await res.json();

        if (error.ErrorCode) {
            throw new Error(error.Msg);
        }

        gametypeid = data['player']['gametypeid'];

        return data;
    }

    async function sendOneRound({bet}) {
        const res = await fetch(url + '/game/result', {
            method: 'POST',
            headers: new Headers({
                Authorization: 'Bearer ' + token,
            }),
            body: JSON.stringify({
                bet,
                gametypeid,
            }),
        });

        const {data, error} = await res.json();

        if (error.ErrorCode) {
            throw new Error(error.Msg);
        }

        return handle(data);
    }

    function handle(data) {
        const totalWin = data['totalwinscore'];
        const cash = data['playermoney'];

        const hasReSpin = Boolean(data['isrespin']);

        const normalGame = Result(data['normalresult']);

        const reSpinGame = hasReSpin && data['respin'].map(Result);

        const jackPot = {
            '5x': data['attach']['JackPartBonusPoolx5'],
            '3x': data['attach']['JackPartBonusPoolx3'],
            '2x': data['attach']['JackPartBonusPoolx2'],
        };

        return {
            cash,
            totalWin,

            normalGame,

            hasReSpin,
            reSpinGame,

            jackPot,
        };
    }

    function Result(data) {
        return {
            hasLink: Boolean(data['islink']),
            scores: data['scores'],
            positions: data['plateindex'],
            symbols: data['plate'],
        };
    }
}
