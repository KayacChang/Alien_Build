
const {assign} = Object;

export function defaultFont(text, config) {
    assign(text.style, {
        fontFamily: 'Arial',
        align: 'center',

        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,

        ...config,
    });

    return text;
}
