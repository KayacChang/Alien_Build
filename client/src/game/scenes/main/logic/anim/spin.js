import anime from 'animejs';
import {nextFrame, wait} from '@kayac/utils';
import {
    MAYBE_BONUS_DURATION,
    getSpinStopInterval,
    getSpinDuration,
    symbolConfig,
} from '../../data';

const empty =
    symbolConfig
        .find(({name}) => name === 'empty')
        .id;

let isQuickStop = false;

export async function spin({reels, symbols, func}) {
    if (!reels.length) reels = [reels];

    await start(reels);

    await duration();

    return stop(reels, symbols, func);
}

async function duration() {
    app.emit('SpinDuration');

    let time = getSpinDuration();

    while (time > 0) {
        const t0 = performance.now();

        await nextFrame();

        const t1 = performance.now();

        if (isQuickStop) return time = 0;

        time -= (t1 - t0);
    }
}

async function start(reels) {
    app.emit('SpinStart');

    isQuickStop = false;
    app.once('QuickStop', () => isQuickStop = true);

    for (const reel of reels) {
        anime
            .timeline({
                targets: reel,
                easing: 'easeOutQuad',
            })
            .add({
                pos: '-=' + 0.25,
                duration: 500,
            })
            .add({
                pos: '+=' + 150,
                duration: 15000,
            });

        await wait(250);
    }
}

async function stop(reels, icons, func) {
    app.emit('SpinStop');

    const stops = [];

    const displaySymbols = [];

    let isMaybeBonus = false;

    const interval = getSpinStopInterval();

    for (const reel of reels) {
        const index = reel.index;

        if (isMaybeBonus) await wait(MAYBE_BONUS_DURATION);

        anime.remove(reel);

        const displaySymbol =
            reel.symbols
                .reduce((a, b) => a.displayPos < b.displayPos ? a : b);

        displaySymbols.push(displaySymbol);

        const icon = icons[index];

        isMaybeBonus = isMaybeBonus || (icon === '00');

        if (icon !== empty) {
            displaySymbol.icon = icons[index];

            reel.pos -= displaySymbol.displayPos;
        } else {
            reel.pos -= (displaySymbol.displayPos + 1);
        }

        const stop = (func) ? func(reel) :
            anime({
                targets: reel,
                pos: '+=' + 2,
                easing: 'easeOutBack',
                duration: 750,

                begin() {
                    app.emit('ReelStop', reel);

                    app.sound.play('Reel_Stop_1');
                    app.sound.play('Reel_Stop_2');
                },
            })
                .finished;

        stops.push(stop);

        await wait(interval);

        if (isMaybeBonus) app.emit('MaybeBonus', reel);
    }

    await Promise.all(stops);

    app.emit('SpinEnd');

    return displaySymbols;
}

