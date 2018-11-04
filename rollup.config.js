export default {
    input: 'src/index.js',
    output: {
        indent: '\t',
        format: 'umd',
        name: 'XType',
        file: 'dist/XType.js'
    },
    treeshake: true,
    external: [],
    plugins: []
};
