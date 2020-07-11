import './styles/App.scss';

import {Application} from 'pixi.js';
import EventEmitter from 'eventemitter3';
import {Sound} from './modules/sound';
import {Resource} from './modules/resource';
import {User} from './user';
import {isMobile} from './modules/device';

const {defineProperties, assign, freeze} = Object;

function getQuality() {
    return (
        new URL(location).searchParams.get('quality') ||
        localStorage.getItem('quality')
    );
}

function getScale(quality) {
    if (quality === 'high') {
        return 1;
    }
    if (quality === 'low') {
        return 0.5;
    }

    return isMobile() ? 0.5 : 1;
}

function getSize(quality) {
    return {
        width: 1920 * getScale(quality),
        height: 1080 * getScale(quality),
    };
}

export default (function () {
    const app = new Application({
        ...getSize(getQuality()),
    });

    localStorage.setItem('quality', getQuality());

    //  Resource
    const resource = Resource(app);
    const user = User(app);
    //  Sound
    const sound = Sound(app);

    let translate = undefined;
    let service = undefined;
    let control = undefined;
    let alert = undefined;

    //  Modules
    defineProperties(app, {
        resource: {
            get: () => resource,
        },
        sound: {
            get: () => sound,
        },
        alert: {
            get: () => alert,
            set: (alertFunc) => (alert = alertFunc),
        },
        service: {
            get: () => service,
            set: (newService) => (service = newService),
        },
        user: {
            get: () => user,
        },
        control: {
            get: () => control,
            set: (newControl) => (control = newControl),
        },
        translate: {
            get: () => translate,
            set: (translateFunc) => (translate = translateFunc),
        },
    });

    //  EventCore
    const eventCore = new EventEmitter();

    //  Functions
    assign(app, {
        //  EventEmitter ==================
        on(event, listener) {
            eventCore.on(event, listener);
        },
        once(event, listener) {
            eventCore.once(event, listener);
        },
        off(event, listener) {
            eventCore.off(event, listener);
        },
        emit(event, ...args) {
            eventCore.emit(event, ...args);
        },
        //  Screen Management ==================
        resize() {
            app.stage.children.forEach((scene) => {
                scene.scale.set(getScale(getQuality()));
            });
        },
    });

    return freeze(app);
})();
