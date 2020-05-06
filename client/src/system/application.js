import './styles/App.scss';

import {Application} from 'pixi.js';
import EventEmitter from 'eventemitter3';
import {Sound} from './modules/sound';
import {Resource} from './modules/resource';
import {resize} from './modules/screen';
import {User} from './user';

const {defineProperties, assign, freeze} = Object;

export default (function() {
    const app = new Application({
        resolution: devicePixelRatio || 1,
        antialias: true,
    });

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
            resize(app);
            app.emit('resize');
        },
    });

    //  Event Binding
    global.addEventListener('resize', app.resize);
    global.addEventListener('orientationchange', app.resize);

    return freeze(app);
})();
