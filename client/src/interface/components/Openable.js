export function Openable(it) {
    it.open = open;
    it.close = close;
    return it;

    function open() {
        it.visible = true;
        it.alpha = 1;
    }

    function close() {
        it.visible = false;
        it.alpha = 0;
    }
}
