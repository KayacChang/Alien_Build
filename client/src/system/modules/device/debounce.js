export default function debounce (fn) {
    let cancel

    return (...args) => {
        window.cancelAnimationFrame(cancel)

        cancel = window.requestAnimationFrame(() => fn(...args))
    }
}
