import {Clickable, defaultFont} from '../../components'
import {Container, Text} from 'pixi.js'
import anime from 'animejs'
import {setBehaviour} from './button'

import {pi, clone} from '@kayac/utils'

const {assign} = Object

export function SpinButton (view) {
    let it = Clickable(view.getChildByName('spin'))

    it.getChildByName('mask').alpha = Number.MIN_VALUE

    it.originScale = {
        x: it.scale.x,
        y: it.scale.y,
    }

    const img = it.getChildByName('frame')

    const block = view.getChildByName('block')

    const msg = defaultFont(
        new Text(translate('common:message.insufficientBalance')),
        {
            fontFamily: 'Candal',
            fontSize: 48,
            fill: '#ffc105',
            stroke: '#121212',
            strokeThickness: 5,
        },
    )

    const comp = new Container()
    comp.addChild(msg)
    comp.position.set(view.width / 2, view.height / 2 - msg.height)
    msg.alpha = 0
    msg.pivot.set(comp.width / 2, comp.height / 2)
    view.addChild(comp)

    setBehaviour(it)

    let isBlocking = false
    let isRunning = false
    let isAuto = false
    let isQuickStop = false
    let whenAnim = false
    let count = 0
    let speed = app.user.speed

    const countField = defaultFont(new Text(), {
        fontFamily: 'Candal',
        fontSize: 48,
        fill: '#FAFAFA',
    })
    it.addChildAt(countField, it.getChildIndex(it.getChildByName('hover')))

    countField.anchor.set(0.5)

    countField.position.set(
        it.getChildByName('down').x,
        it.getChildByName('down').y,
    )

    const auto = {
        get () {
            return count
        },
        set (newCount) {
            count = newCount

            if (newCount === 0) {
                countField.text = ''

                isAuto = false

                return
            }

            countField.text = newCount

            isAuto = true
        },
    }

    it = assign(it, {auto})

    const arrow = it.getChildByName('arrow')
    const arrowScale = clone(arrow.scale)

    const square = it.getChildByName('square')

    if (cashLessThanBet()) {
        img.tint = 0x999999
        isBlocking = true

        it.auto.set(0)
    } else {
        img.tint = 0xffffff
        isBlocking = false
    }

    it.on('Click', onClick)

    app.on('Idle', checkState)

    app.on('UserStatusChange', checkButton)
    app.on('UserBetChange', checkButton)
    app.on('UserAutoChange', checkButton)

    return it

    function checkButton () {
        if (cashLessThanBet()) {
            img.tint = 0x999999
            isBlocking = true

            it.auto.set(0)
        } else {
            img.tint = 0xffffff
            isBlocking = false
        }

        const auto = app.user.autoOptions[app.user.auto]
        it.auto.set(auto)
    }

    function checkState () {
        if (cashLessThanBet()) {
            if (!whenAnim) {
                whenAnim = true
                view.openMenu('exchange').then(() => (whenAnim = false))
            }

            return spinEnd()
        }

        if (it.auto.get() > 0 && isAuto && isRunning) {
            isRunning = false
            play()
        } else {
            spinEnd()
        }
    }

    function spinEnd () {
        anime.remove(arrow)

        anime({
            targets: square.scale,
            x: 0,
            y: 0,
        })

        anime({
            targets: arrow.scale,
            x: arrowScale.x,
            y: arrowScale.y,
        })

        anime({
            targets: arrow,
            rotation: '-=' + (arrow.rotation % (2 * pi)),
            alpha: 1,
        })

        anime({
            targets: view,
            alpha: 1,
            easing: 'easeOutCubic',
        })

        requestAnimationFrame(() => {
            view.menuBtn.interactive = true
            view.option.btn.interactive = true

            isRunning = false
            isQuickStop = false

            app.user.speed = speed

            checkButton()
        })
    }

    function cashLessThanBet () {
        return app.user.cash < app.user.betOptions[app.user.bet]
    }

    function onClick () {
        if (whenAnim) return
        if (isBlocking) {
            if (isRunning) return

            whenAnim = true
            anime({
                targets: msg,
                alpha: 1,
                duration: 500,
                direction: 'alternate',
                easing: 'easeOutExpo',
                complete () {
                    msg.alpha = 0
                    whenAnim = false
                },
            })

            anime({
                targets: block,
                alpha: 0.5,
                duration: 500,
                direction: 'alternate',
                easing: 'easeOutExpo',
                complete () {
                    block.alpha = 0
                    whenAnim = false
                },
            })

            app.sound.play('cancel')

            return
        }

        if (isRunning) {
            app.user.auto = 0
            it.auto.set(0)

            const max = app.user.speedOptions.length - 1
            app.user.speed = max

            if (!isQuickStop) {
                isQuickStop = true

                setTimeout(() => app.emit('QuickStop'), 250)
            }

            return
        }

        return play()
    }

    function play () {
        if (isRunning) return

        it.scale.x -= 0.1
        it.scale.y -= 0.1

        anime({
            targets: it.scale,
            x: it.originScale.x,
            y: it.originScale.y,
            easing: 'easeOutElastic(1, .5)',
            duration: 300,
        })

        anime({
            targets: square.scale,
            x: 1,
            y: 1,
        })

        anime({
            targets: arrow.scale,
            x: 0,
            y: 0,
        })

        anime({
            targets: arrow,
            alpha: 0,
        })

        anime({
            targets: arrow,
            rotation: '-=' + 2 * pi,
            loop: true,
            easing: 'linear',
            duration: 1000,
        })

        anime({
            targets: view,
            alpha: 0.6,
            easing: 'easeOutCubic',
            duration: 1000,
        })

        app.sound.play('spin')

        app.user.cash -= app.user.betOptions[app.user.bet]
        app.user.lastWin = 0

        speed = app.user.speed
        view.menuBtn.interactive = false
        view.option.btn.interactive = false

        isRunning = true

        if (auto.get() > 0) {
            auto.set(auto.get() - 1)
        }

        const key = process.env.KEY

        app.service
            .sendOneRound({
                key,
                bet: app.user.bet,
            })
            .then((result) => app.emit('GameResult', result))
    }
}
