import {symbolConfig} from '../../data';

import {randomInt, wait} from '@kayac/utils';

export async function show(effects, result) {
    app.emit('ShowResult', result);

    const {symbols} = result;

    let sound = undefined;

    symbols.forEach((id, index) => {
        const effect = effects[index];

        const name = getSymbolNameBy(id);

        if (name === 'empty') return;

        if (name.includes('wild')) {
            sound = wild(effect, name);
            //
        } else if (name.includes('alien')) {
            const _sound = alien(effect, name);

            if (sound !== 'Jackpot_Connect') sound = _sound;
            //
        } else {
            const _sound = normal(effect, name);

            sound = sound || _sound;
            //
        }
    });

    if (sound) app.sound.play(sound);

    await wait(2000);
}

function getSymbolNameBy(icon) {
    return symbolConfig
        .find(({id}) => id === icon)
        .name;
}

function normal(effect, name) {
    const target = effect.getChildByName(name);

    const animation = target.transition['anim'];

    animation.loop = true;

    play(target, animation);

    return 'Normal_Connect';
}

function wild(effect, name) {
    const [_name, anim] = name.split('@');

    const target = effect.getChildByName(_name);
    const animation = target.transition[anim];

    target.getChildByName('combo')
        .children
        .forEach((view) => view.visible = false);

    play(target, animation);

    return 'Jackpot_Connect';
}

function alien(effect, name) {
    const target = effect.getChildByName(name);

    const animation = target.transition['anim'];

    const alien = target.getChildByName('alien');

    const type = randomInt(4);

    const expression = alien.transition[type];

    expression.loop = true;
    animation.loop = true;

    expression.restart();

    play(target, animation);

    app.on('SpinStart', () => {
        expression.loop = undefined;
        expression.pause();
    });

    return `Alien_${type}`;
}

function play(target, anim) {
    target.visible = true;
    anim.restart();

    app.on('SpinStart', () => {
        target.visible = false;
        anim.loop = undefined;
        anim.pause();
    });
}
