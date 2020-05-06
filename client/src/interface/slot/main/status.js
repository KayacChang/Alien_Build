import {defaultFont} from '../../components';
import {
    currencyFormat,
    toValue,
    signFormat,
} from '@kayac/utils';
import anime from 'animejs';

export function Status(view) {
    init(view);

    Cash(
        view.getChildByName('field@cash'),
        view.getChildByName('effect@cash'),
    );

    Bet(
        view.getChildByName('field@bet'),
    );

    Win(
        view.getChildByName('field@win'),
    );

    return view;
}

function init(view) {
    view.children
        .filter(({content}) => content !== undefined)
        .forEach((field) => {
            const [type, name] = field.name.split('@');

            if (type === 'label') {
                defaultFont(field.content, {fontFamily: 'Basic'});

                field.content.text = translate(`common:status.${name}`);
                //
            } else if (type === 'field' || type === 'effect') {
                defaultFont(field.content, {fontFamily: 'Candal'});
            }
        });
}

function Cash(it, effect) {
    const proxy = {
        get cash() {
            return toValue(it.content.text);
        },
        set cash(newCash) {
            it.content.text = currencyFormat(newCash);
        },
    };

    let lastCash = app.user.cash;

    update(app.user.cash);

    app.on('UserCashChange', update);

    function update(cash) {
        showEffect(cash - lastCash);

        lastCash = cash;

        anime({
            targets: proxy,
            cash,
            easing: 'linear',
            duration: 720,
        });
    }

    function showEffect(diff) {
        if (diff <= 0) return;

        const {style} = effect.content;

        style.fill = '#30D158';

        effect.content.text = signFormat(diff);

        anime({
            targets: effect,
            y: -30,
            easing: 'easeOutExpo',
        });

        anime
            .timeline({
                targets: effect,
            })
            .add({
                alpha: 1,
                easing: 'easeOutExpo',
            })
            .add({
                alpha: 0,
                easing: 'easeOutExpo',
                complete() {
                    effect.y = 30;
                },
            });
    }
}

function Bet(it) {
    update(app.user.bet);

    app.on('UserBetChange', update);

    return it;

    function update(index) {
        it.content.text = currencyFormat(
            app.user.betOptions[index],
        );
    }
}

function Win(it) {
    const proxy = {
        get scores() {
            return toValue(it.content.text);
        },
        set scores(newScores) {
            it.content.text = currencyFormat(newScores);
        },
    };

    proxy.scores = app.user.lastWin;

    app.on('UserLastWinChange', update);

    return proxy;

    function update(scores) {
        anime({
            targets: proxy,
            scores,
            easing: 'linear',
            duration: 720,
        });
    }
}
