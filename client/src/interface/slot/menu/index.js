import {Clickable, Openable} from '../../components';
import {Setting} from './setting';
import anime from 'animejs';
import {Information} from './information';

const {entries} = Object;

export function Menu(parent) {
    const menu = Openable(parent.getChildByName('menu'));
    menu.interactive = true;

    const background = menu.getChildByName('background');
    background.scale.set(0);

    const hr = menu.getChildByName('hr');
    hr.scale.x = 0;

    const navBackground = menu.getChildByName('nav@background');
    navBackground.originPos = {
        x: navBackground.position.x,
        y: navBackground.position.y,
    };

    const block = menu.getChildByName('block');
    block.on('pointerdown', () => close());

    menu.block = block;

    const setting = Setting(menu);
    const information = Information(menu);

    const sections = new Map(
        entries({
            setting,
            information,
        }),
    );
    sections.forEach((section) => (section.alpha = 0));

    const nav = Nav(menu, sections);
    nav.originPos = {
        x: nav.position.x,
        y: nav.position.y,
    };
    nav.y = 0;
    nav.alpha = 0;

    menu.open = openNav;
    menu.close = close;

    menu.setting = setting;
    menu.information = information;

    return menu;

    async function openNav(section) {
        menu.visible = true;
        menu.alpha = 1;

        if (menu.section) menu.section.visible = false;

        menu.section = undefined;
        nav.tab.alpha = 0;
        nav.btns.forEach((btn) => (btn.icon.alpha = 0.5));

        block.interactive = true;

        navBackground.position.x = navBackground.originPos.x;
        background.scale.set(0);
        hr.scale.x = 0;

        await anime
            .timeline()
            .add({
                targets: navBackground,
                x: '-=' + navBackground.width,
                duration: 500,
                easing: 'easeInOutExpo',
            })
            .add({
                targets: nav,
                alpha: 1,
                y: nav.originPos.y,
                duration: 320,
                easing: 'easeOutQuad',
                complete() {
                    if (section) {
                        nav.open(sections.get(section));
                    }
                },
            }).finished;
    }

    function close() {
        if (!menu.visible) return;

        parent.main.updateStatus();

        if (menu.section) menu.section.close();

        anime({
            targets: hr.scale,
            x: 0,
            duration: 300,
            easing: 'easeOutQuart',
        });

        anime({
            targets: navBackground,
            x: '+=' + navBackground.width,
            duration: 500,
            easing: 'easeInOutExpo',
        });

        anime
            .timeline()
            .add({
                targets: nav,
                alpha: 0,
                y: 0,
                duration: 300,
                easing: 'easeOutQuart',
            })
            .add({
                targets: background.scale,
                x: 0,
                y: 0,
                duration: 500,
                easing: 'easeInOutExpo',
                complete() {
                    menu.visible = false;
                    menu.alpha = 0;
                },
            });
    }
}

function Nav(menu, sections) {
    const nav = menu.getChildByName('nav');

    const background = menu.getChildByName('background');

    const hr = menu.getChildByName('hr');

    BackButton(nav.getChildByName('back'), menu);

    const tab = nav.getChildByName('tab');

    nav.tab = tab;

    const navBtns = nav.children
        .filter(({name}) => name.includes('btn'))
        .map(NavButton);
    nav.btns = navBtns;

    nav.updateState = updateState;

    nav.open = open;

    return nav;

    function updateState() {
        const target = menu.section.name;
        let targetBtn = undefined;

        navBtns.forEach((btn) => {
            const [, name] = btn.name.split('@');

            if (name === target) {
                btn.icon.alpha = 0.9;
                targetBtn = btn;
            } else {
                btn.icon.alpha = 0.5;
            }
        });

        return anime({
            targets: tab,
            y: targetBtn.y,
            alpha: 0.9,
            duration: 300,
            easing: 'easeOutQuart',
        }).finished;
    }

    function NavButton(it) {
        const [, name] = it.name.split('@');

        it.icon = nav.getChildByName(`img@${name}`);

        it = Clickable(it);
        it.on('pointerdown', click);

        return it;

        async function click() {
            if (sections.has(name)) {
                const target = sections.get(name);
                if (menu.section === target) return;

                if (menu.section) await menu.section.close();

                return open(target);
            }
        }
    }

    async function open(section) {
        menu.block.interactive = false;

        menu.section = section;
        updateState();

        if (background.scale.x < 1) {
            await anime
                .timeline()
                .add({
                    targets: background.scale,
                    x: 1,
                    y: 1,
                    duration: 500,
                    easing: 'easeInOutExpo',
                })
                .add({
                    targets: hr.scale,
                    x: 1,
                    duration: 300,
                    easing: 'easeOutQuad',
                }).finished;
        }

        await section.open();
    }

    function BackButton(btn, menu) {
        btn = Clickable(btn);
        btn.on('pointerdown', () => menu.close());
        return btn;
    }
}
