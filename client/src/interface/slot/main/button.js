import anime from 'animejs';

import {isMobile} from 'pixi.js/lib/core/utils';

export function setBehaviour(it) {
    const hoverMaskView = it.getChildByName('hover');
    const downMaskView = it.getChildByName('down');

    const anim = {
        duration: 350,
        easing: 'easeOutCubic',
    };
    const normal = {
        hoverMask: {
            alpha: 0,
        },
        downMask: {
            alpha: 0,
        },
    };
    const hover = {
        hoverMask: {
            alpha: 0.1,
        },
        downMask: {
            alpha: 0,
        },
    };

    it.on('Hover', onHover);

    it.on('Normal', onNormal);

    it.on('Click', ({data}) => {
        onClick({data});
    });

    it.on('Change', ({data, checked}) => {
        onClick({data, checked});
    });

    return it;

    function onNormal() {
        if (isMobile.phone) return;
        anime({
            targets: hoverMaskView,
            ...(anim),
            ...(normal.hoverMask),
        });
        anime({
            targets: downMaskView,
            alpha: 0,
            duration: 160,
            easing: 'easeOutSine',
        });
    }

    function onHover() {
        if (isMobile.phone) return;
        anime({
            targets: hoverMaskView,
            ...(anim),
            ...(hover.hoverMask),
        });
        anime({
            targets: downMaskView,
            alpha: 0,
            duration: 160,
            easing: 'easeOutSine',
        });
    }

    function onClick({data}) {
        if (isMobile.phone) return;
        const {x, y} = data.getLocalPosition(it);
        downMaskView.position.set(x, y);
        downMaskView.alpha = 0.3;
        anime({
            targets: downMaskView.scale,
            x: [0, 1.8],
            y: [0, 1.8],
            duration: 300,
            easing: 'easeOutQuad',
        });
    }
}
