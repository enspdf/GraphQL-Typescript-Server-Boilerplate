require("ts-node/register");

const {
    setup
} = require("./setup");

module.exports = async () => {
    await setup();
    return null;
};