import when from './when'
import {isBarHidden, isPortrait, inIframe} from './detecter'
import debounce from './debounce'
import {select} from '@kayac/utils'

export default function iPhoneFullScreen () {
    if (inIframe()) return

    const icon = select('#icon')
    const mask = select('#mask')

    // const img = ScrollImg()

    // const mask = ScrollMask()

    // document.body.append(img, mask)

    const scrollToTop = debounce(() => window.scrollTo({top: 0}))

    let holding = false

    const triggerMask = debounce((evt) => {
        if (holding) return

        if (!isPortrait() && isBarHidden()) {
            icon.classList.add('hidden')
            mask.classList.add('hidden')
            return
        }

        icon.classList.remove('hidden')
        mask.classList.remove('hidden')

        scrollToTop()
    })

    mask.addEventListener('touchmove', (event) => {
        holding = true
    })
    mask.addEventListener('touchend', (event) => {
        holding = false

        triggerMask()
    })

    when(window, 'resize', triggerMask)
    when(window, 'orientationchange', triggerMask)

    scrollToTop()
    triggerMask()
}
