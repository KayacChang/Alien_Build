import {Openable} from '../../components/Openable';
import {Clickable, ToggleButton, RangeSlider} from '../../components';

import anime from 'animejs';
import {kFormat, kCurrencyFormat, rgb2hex} from '@kayac/utils';

export function Setting(menu) {
    const setting = Openable(
        menu.getChildByName('setting'),
    );

    setting.getChildByName('title')
        .text = translate(`common:setting.title`);

    setLabel(setting, 'audio');

    const effectSwitch =
        Toggle(setting, 'effects');

    const ambienceSwitch =
        Toggle(setting, 'ambience');

    effectSwitch.set(!app.sound.mute());
    ambienceSwitch.set(!app.sound.mute());

    const volumeRange = [
        0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
    ];
    const textVolume =
        setting.getChildByName(`text@volume`);
    const volume =
        Slider(setting, 'volume', {
            range: volumeRange,
            onchange: (level) => {
                app.sound.volume(volumeRange[level]);

                app.sound.mute(level === 0);
                effectSwitch.set(!app.sound.mute());
                ambienceSwitch.set(!app.sound.mute());

                textVolume.text = level;
            },
        });

    setLabel(setting, 'spin');

    const textAuto =
        setting.getChildByName(`text@auto`);
    const auto =
        Slider(setting, 'auto', {
            range: app.user.autoOptions,
            onchange: (level) => {
                app.user.auto = level;
                textAuto.text = kFormat(app.user.autoOptions[level]);
            },
        });

    const textSpeed =
        setting.getChildByName(`text@speed`);
    const speed =
        Slider(setting, 'speed', {
            range: app.user.speedOptions,
            onchange: (level) => {
                app.user.speed = level;
                textSpeed.text = level + 1;
            },
        });

    setLabel(setting, 'bet');

    const textBetLevel =
        setting.getChildByName(`text@betLevel`);
    const betLevel =
        Slider(setting, 'betLevel', {
            range: app.user.betOptions,
            onchange: (level) => {
                app.user.bet = level;
                textBetLevel.text = kCurrencyFormat(app.user.betOptions[level]);
            },
        });
    setting
        .getChildByName(`label@betLevel_min`)
        .content.text = kCurrencyFormat(app.user.betOptions[0]);
    setting
        .getChildByName(`label@betLevel_max`)
        .content.text =
        kCurrencyFormat(
            app.user.betOptions[app.user.betOptions.length - 1]
        );

    setting.y -= 53;
    setting.open = open;
    setting.close = close;

    setting.volume = volume;
    setting.auto = auto;
    setting.speed = speed;
    setting.betLevel = betLevel;

    return setting;

    function open() {
        setting.visible = true;

        const soundLevel =
            app.sound.mute() === true ?
                0 : volumeRange.length - 1;
        volume.setLevel(soundLevel);

        speed.setLevel(app.user.speed);
        betLevel.setLevel(app.user.bet);
        auto.setLevel(app.user.auto);

        betLevel.enable = !app.user.isBetLock;

        return anime({
            targets: setting,
            alpha: 1, y: 0,
            duration: 300,
            easing: 'easeOutQuad',
        }).finished;
    }

    function close() {
        return anime({
            targets: setting,
            alpha: 0, y: '-=' + 53,
            duration: 300,
            easing: 'easeOutQuad',
            complete() {
                setting.visible = false;
            },
        }).finished;
    }
}

function setLabel(setting, target) {
    setting.getChildByName(`label@${target}`)
        .text = translate(`common:setting.${target}`);
}

function Toggle(setting, target) {
    setLabel(setting, target);

    const ball =
        setting.getChildByName(`ball@${target}`);
    ball._color = '#FFFFFF';

    const toggle = ToggleButton(
        setting.getChildByName(`frame@${target}`),
    );

    toggle.on('Change', () => update(toggle.checked));

    update(toggle.checked);

    return {set};

    function set(checked) {
        toggle.checked = checked;
        update(toggle.checked);
    }

    function update(checked) {
        app.sound[target] = checked;

        const x = (checked) ?
            toggle.x + (toggle.width / 2) : toggle.x - 4;

        return anime({
            targets: ball,
            x,
            _color: (checked) ? '#FFFFFF' : '#999999',
            duration: 260,
            easing: 'easeOutQuad',
            update() {
                const [r, g, b] = ball._color.match(/\d+/g).map(Number);

                ball.tint = rgb2hex([r, g, b]);
            },
        });
    }
}

function Slider(setting, target, {range, onchange}) {
    setLabel(setting, target);

    const frame = Clickable(
        setting.getChildByName(`frame@${target}`),
    );

    const parts = range.length - 1;
    const base = (frame.width / parts);
    const moveRange =
        range.map((level, index) => base * index);

    frame.on('pointerdown', click);

    const slider = RangeSlider(
        setting.getChildByName(`slider@${target}`),
        frame,
    );

    const valueBar =
        setting.getChildByName(`value@${target}`);

    const text =
        setting.getChildByName(`text@${target}`);
    text.x = slider.x;

    if (range) {
        const minLabel =
            setting
                .getChildByName(`label@${target}_min`);
        const maxLabel =
            setting
                .getChildByName(`label@${target}_max`);

        if (minLabel) minLabel.content.text = range[0];

        if (maxLabel) maxLabel.content.text = range[range.length - 1];
    }

    let level = 0;
    let enable = true;

    slider.onDragMove = () => {
        if (!enable) return;
        if (slider.getPos) {
            const {x} = slider.getPos();

            setLevel(condition(x));
        }
    };

    return {
        get enable() {
            return enable;
        },
        set enable(flag) {
            enable = flag;

            slider.tint = enable ? 0xFFFFFF : 0x999999;
            valueBar.tint = enable ? 0xFFFFFF : 0x999999;
        },

        setLevel,
    };

    function click({data}) {
        if (!enable) return;
        const {x} = data.getLocalPosition(frame);

        const level =
            (x < moveRange[1] / 2) ? 0 :
                moveRange.findIndex((range) => range > x);

        setLevel(level);
    }

    function setLevel(value) {
        level = value;

        slider.x = frame.x + moveRange[level];
        text.x = slider.x;
        valueBar.width = moveRange[level];

        onchange(level);

        return level;
    }

    function condition(x) {
        if (x <= 0) return 0;
        const level = moveRange.findIndex((range) => range > x);
        return (
            (level === 0) ? 0 :
                (level === -1) ? parts :
                    level - 1
        );
    }
}


