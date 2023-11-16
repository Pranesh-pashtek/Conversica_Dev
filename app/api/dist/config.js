const defaultPort = 8080;
function getEnvVar(envVar, required = true, defaultValue) {
    const value = process.env[envVar];
    if (!value && required) {
        throw new Error(`${envVar} is required`);
    }
    return value || defaultValue || "";
}
export function isDev() {
    return process.env.NODE_ENV === "development";
}
export function getAppPort() {
    const port = process.env.PORT;
    if (!port) {
        return defaultPort;
    }
    return parseInt(port, 10);
}
export function getAppConfig() {
    return {
        cookieSecret: getEnvVar("COOKIE_SECRET_KEY"),
        jwtSecret: getEnvVar("JWT_SECRET"),
        redirectUiToLocalhost: getEnvVar("REDIRECT_UI_TO_LOCALHOST") === "true"
            ? true
            : false,
        selfDomain: getEnvVar("SELF_DOMAIN"),
        sfmcClientId: getEnvVar("SFMC_CLIENT_ID"),
        sfmcClientSecret: getEnvVar("SFMC_CLIENT_SECRET"),
        sfmcDefaultTenantSubdomain: getEnvVar("SFMC_DEFAULT_TENANT_SUBDOMAIN")
    };
}
