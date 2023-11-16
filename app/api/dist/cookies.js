import { isDev } from "./config";
export const TWENTY_MINS_IN_SECONDS = 20 * 60;
export const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;
export const ONE_HOUR_IN_SECONDS = 60 * 60;
export function getCookieOptions(maxAge, httpOnly = true) {
    return {
        secure: !isDev(),
        httpOnly,
        sameSite: "none",
        signed: true,
        maxAge: maxAge ? maxAge * 1000 : maxAge,
    };
}
