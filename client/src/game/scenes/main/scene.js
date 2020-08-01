import {addPackage} from 'pixi_fairygui'

import {Background, Light, SlotMachine, Waters} from './components'

import {logic} from './logic'
import {fadeIn, fadeOut, moveIn, moveOut, popIn} from './effect'

import {BitmapText} from 'pixi.js'

export function create ({normalreel}) {
    const create = addPackage(app, 'main')
    const scene = create('MainScene')

    return init()

    function init () {
        const slot = SlotMachine({
            view: scene,
            table: normalreel,
        })

        const effects = scene.children
            .filter(({name}) => name && name.includes('effect'))
            .sort((a, b) => id(a) - id(b))

        const background = Background(select('background'))

        const style = {fontName: 'Score', fontSize: 36}
        const score = new BitmapText('0', style)

        app.on('RespinStart', () => {
            const normal = select('shadow@normal')

            if (scene.children.includes(score)) {
                fadeOut({targets: score})
                moveOut({targets: score, y: '-=' + 30})
                scene.removeChild(score)
            }

            fadeOut({targets: normal})

            const targets = select('shadow@respin')

            fadeIn({targets, alpha: 0.7})

            app.once('Idle', () => fadeOut({targets}))
        })

        app.on('ShowResult', async ({scores}) => {
            const targets = select('shadow@normal')

            await fadeIn({targets, alpha: 0.7}).finished

            score.text = scores
            score.anchor.set(0.5)

            const start = select('pos_start@score')
            const end = select('pos_end@score')

            score.position.set(start.x, start.y)
            scene.addChildAt(score, scene.getChildIndex(start))

            fadeIn({targets: score})
            moveIn({targets: score, y: end.y})
            popIn({targets: score})

            app.once('SpinStart', async () => {
                const duration = 500
                fadeOut({
                    targets: score,
                    easing: 'easeOutQuart',
                    duration,
                })
                moveOut({
                    targets: score,
                    y: '-=' + 100,
                    duration,
                })

                await fadeOut({targets}).finished
                scene.removeChild(score)
            })
        })

        const lights = scene.children
            .filter(({name}) => name && name.includes('light'))
            .sort((a, b) => id(a) - id(b))
            .map(Light)

        app.on('MaybeBonus', onMaybeBonus)

        Waters(scene)

        logic({
            slot,
            effects,
            background,
        })

        app.alert
            .request({title: translate(`common:message.audio`)})
            .then(({value}) => {
                app.sound.mute(!value)

                app.sound.play('Normal_BGM')
            })

        return scene

        function onMaybeBonus (reel) {
            const current = reel.index
            const next = current + 1

            lights[current].off()

            if (next < lights.length) {
                app.sound.play('Maybe_Bonus')
                lights[next].show()
            }
        }
    }

    function select (name) {
        return scene.getChildByName(name)
    }
}

function id ({name}) {
    return Number(name.split('@')[1])
}
