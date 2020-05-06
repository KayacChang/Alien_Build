import {throttle, isMobile} from '@kayac/utils';

const {defineProperties} = Object;

export function Clickable(it) {
    it.buttonMode = true;
    it.interactive = true;

    if (!isMobile.phone) {
        it.on('pointerover', throttleFunc(onHover));
        it.on('pointerout', throttleFunc(onNormal));
        it.on('pointerdown', throttleFunc(onClick));
        it.on('pointerup', throttleFunc(onHover));
    } else {
        it.on('pointerdown', throttleFunc(onClick));
        it.on('pointerup', throttleFunc(onNormal));
    }

    return defineProperties(it, {
        enable: {
            get() {
                return it.interactive;
            },
            set(flag) {
                it.interactive = flag;
            },
        },
    });

    function onHover(...args) {
        it.emit('Hover', ...args);
    }

    function onClick(...args) {
        it.emit('Click', ...args);
    }

    function onNormal(...args) {
        it.emit('Normal', ...args);
    }

    function throttleFunc(func) {
        return throttle(
            func, 400,
            {leading: true, trailing: false},
        );
    }
}

export function ToggleButton(it) {
    it = Clickable(it);

    it.checked = false;

    it.on('Click', onClick);

    return it;

    function onClick(evt) {
        it.checked = !it.checked;
        evt.checked = it.checked;
        it.emit('Change', evt);
    }
}
