//  Imports

//  Exports
module.exports = function(env) {
    return {
        //  Mode    ================================================
        mode: 'production',

        //  Optimization    ====================================
        optimization: {
            usedExports: true,
            sideEffects: false,
            concatenateModules: true,

            splitChunks: {
                chunks: 'all',
                minSize: 0,
                maxInitialRequests: Infinity,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const packageName = module.context.match(
                                /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
                            )[1];

                            return `${packageName.replace('@', '')}`;
                        },
                    },
                },
            },
        },
    };
};
