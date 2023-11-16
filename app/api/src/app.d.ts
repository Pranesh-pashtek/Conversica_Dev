declare module "app" {
    export interface Config {
        cookieSecret: string;
        jwtSecret: string;
        redirectUiToLocalhost: boolean;
        selfDomain: string;
        sfmcClientId: string;
        sfmcClientSecret: string;
        sfmcDefaultTenantSubdomain: string;
    }
}
