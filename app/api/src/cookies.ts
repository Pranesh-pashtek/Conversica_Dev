import express from "express";
import { isDev } from "./config";

export const TWENTY_MINS_IN_SECONDS = 20 * 60;
export const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;
export const ONE_HOUR_IN_SECONDS = 60 * 60;

/**
 * Returns a cookie options object that can be used to set a cookie
 * with `res.cookie()` in Express.
 * @param maxAge The max age for the cookie being set. Default is `TWENTY_MINS_IN_SECONDS`.
 * @param httpOnly Whether the cookie should be inaccessible to the client via `document.cookies`. Default is true.
 */
export function getCookieOptions(
    maxAge?: number,
    httpOnly = true
): express.CookieOptions {
    return {
        secure: !isDev(),
        httpOnly,
        sameSite: "none",
        // Always set signed cookies to prevent tampering of cookie values.
        signed: true,
        // ExpressJS expects the maxAge to be in milliseconds.
        // https://expressjs.com/en/4x/api.html#res.cookie
        maxAge: maxAge ? maxAge * 1000 : maxAge,
    };
}
