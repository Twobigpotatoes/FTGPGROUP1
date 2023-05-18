module.exports = {
    contracts_build_directory: './web/src/contracts',
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: 1337,
        },
    },
    compilers: {
        solc: {
            version: "./node_modules/solc",
        }
    }
};
