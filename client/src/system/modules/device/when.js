export default function when (target, type, fn) {
    let ticking = false

    target.addEventListener(type, (event) => {
        if (ticking) return

        window.requestAnimationFrame(() => {
            fn(event)

            ticking = false
        })

        ticking = true
    })
}
