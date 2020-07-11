import {utils} from 'pixi.js'

export function isMobile () {
    return utils.isMobile.phone
}

export function isTablet () {
    return utils.isMobile.tablet
}

export function isBarHidden () {
    const diff = window.outerHeight - window.innerHeight

    const trigger = isChrome() ? window.outerHeight / 10 : 0

    return diff <= trigger
}

export function isPortrait () {
    return window.innerHeight > window.innerWidth
}

export function isChrome () {
    const userAgent = window.navigator.userAgent
    return /Chrome/i.test(userAgent) || /CriOS/i.test(userAgent)
}

export function isPWA () {
    return navigator['standalone']
}

export function inIframe () {
    return window.self !== window.top
}
