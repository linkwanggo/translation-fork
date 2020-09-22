const transformer = require('ts-transformer-keys/transformer').default;
require("ts-node").register({
    transformers: program => ({
        before: [
            transformer(program)
        ]
    })
});