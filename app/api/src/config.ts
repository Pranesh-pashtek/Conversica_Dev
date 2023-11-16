import { Config } from "app";

const defaultPort = 8080;

function getEnvVar(
    envVar: string,
    required: boolean = true,
    defaultValue?: string
): string {
    const value = process.env[envVar];
    if (!value && required) {
        throw new Error(`${envVar} is required`);
    }

    return value || defaultValue || "";
}

export function isDev(): boolean {
    return process.env.NODE_ENV === "development";
}

export function getAppPort(): number {
    const port = process.env.PORT;
    if (!port) {
        return defaultPort;
    }

    return parseInt(port, 10);
}

export function getAppConfig(): Config {
    return {
        cookieSecret: getEnvVar("COOKIE_SECRET_KEY"),         
        jwtSecret: getEnvVar("JWT_SECRET"),
        redirectUiToLocalhost:
            getEnvVar("REDIRECT_UI_TO_LOCALHOST", false, "false") === "true"
                ? true
                : false,
        selfDomain: getEnvVar("SELF_DOMAIN", false, "http://localhost:8080"),
        sfmcClientId: getEnvVar("SFMC_CLIENT_ID"),
        sfmcClientSecret: getEnvVar("SFMC_CLIENT_SECRET"),
        sfmcDefaultTenantSubdomain: getEnvVar(
            "SFMC_DEFAULT_TENANT_SUBDOMAIN"
        )
    };
}
    