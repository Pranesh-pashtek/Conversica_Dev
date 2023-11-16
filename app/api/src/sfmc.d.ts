declare module "sfmc" {
    export interface AccessTokenResponse {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        scope: string;
        rest_instance_url: string;
    }
}
