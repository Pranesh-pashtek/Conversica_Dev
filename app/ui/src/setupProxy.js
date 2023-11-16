const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/oauth2",
        createProxyMiddleware({
            target: "https://app.localhost:",
            changeOrigin: true,
            secure: false,
        })
    );

    app.use(
        "/api",
        createProxyMiddleware({
            target: "https://app.localhost",
            changeOrigin: true,
            secure: false,
        })
    );
};
