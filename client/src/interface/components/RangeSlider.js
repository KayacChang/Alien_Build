export function RangeSlider(it, parent) {
    it.interactive = true;

    it.buttonMode = true;

    const max = parent.width - it.width;

    it.getPos = undefined;

    it.onDragStart = onDragStart;
    it.onDragMove = onDragMove;
    it.onDragEnd = onDragEnd;

    it
        .on('pointerdown', (e) => it.onDragStart(e))
        .on('pointerup', (e) => it.onDragEnd(e))
        .on('pointerupoutside', (e) => it.onDragEnd(e))
        .on('pointermove', (e) => it.onDragMove(e));

    return it;

    function onDragStart(event) {
        it.getPos = () =>
            event.data.getLocalPosition(parent);
    }

    function onDragEnd() {
        it.getPos = undefined;
    }

    function onDragMove() {
        if (it.getPos) {
            const {x} = it.getPos();

            it.x = condition(x);

            it.emit('Change', percent(it.x));
        }
    }

    function condition(x) {
        return (
            (x <= 0) ? 0 :
                (x >= max) ? max :
                    x
        );
    }

    function percent(num) {
        return Math.floor((num / max) * 100);
    }
}
