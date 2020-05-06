import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {select} from '@kayac/utils';

import app from './system/application';
import {Service} from './service';
import Swal from './system/plugin/swal';
import {Translate} from './system/modules/translate';

import {enableFullScreenMask} from './system/modules/screen';

async function main() {
    //  Init App
    try {
        document.title = 'For Every Gamer | 61 Studio';

        global.app = app;

        global.translate = await Translate(process.env.I18N_URL);

        app.alert = Swal();
        app.service = new Service(process.env.SERVER_URL);

        // Import Load Scene
        const LoadScene = await import('./game/scenes/load/scene');

        await app.resource.load(LoadScene);

        const comp = select('#app');
        const svg = select('#preload');
        svg.remove();

        comp.prepend(app.view);

        const loadScene = LoadScene.create();
        app.stage.addChild(loadScene);
        app.resize();

        enableFullScreenMask();

        //  Import Main Scene
        const [MainScene, UserInterface, initData] = await Promise.all([
            import('./game/scenes/main'),
            import('./interface/slot'),
            app.service.init(),
        ]);

        app.user.id = initData['player']['id'];
        app.user.cash = initData['player']['money'];

        app.user.betOptions = initData['betrate']['betrate'];
        app.user.betOptionsHotKey = initData['betrate']['betratelinkindex'];
        app.user.bet = initData['betrate']['betratedefaultindex'];

        app.user.jackPot = {
            '5x': initData['attach']['JackPartBonusPoolx5'],
            '3x': initData['attach']['JackPartBonusPoolx3'],
            '2x': initData['attach']['JackPartBonusPoolx2'],
        };

        await app.resource.load(MainScene, UserInterface);

        const ui = UserInterface.create();
        const scene = MainScene.create(initData.reel);
        scene.addChild(ui);

        app.stage.addChildAt(scene, 0);

        app.stage.removeChild(loadScene);

        select('script').forEach((el) => el.remove());

        app.resize();

        document.title = translate('title');

        //
    } catch (error) {
        console.error(error);

        const msg = {title: error.message};

        app.alert.error(msg);
    }
}

main();
