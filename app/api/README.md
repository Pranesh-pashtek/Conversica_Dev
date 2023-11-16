# API

This folder contains a Node.js server that serves the `/oauth2` and the `/api` (for API proxying) endpoints.

## Development

To work with OAuth2 user authorization flows, HTTPS is required for local development.
Generate local certs using `openssl` by running the command:

```
openssl req -newkey rsa:2048 -nodes -keyout localhost.key -x509 -days 365 -out localhost.crt -sha256 -subj "/CN=localhost" -addext "subjectAltName = DNS:app.localhost"
```

**Note**: The above command provides an alternate subject name `app.localhost`. SFMC won't allow just `localhost`
to be registered as a redirect URI even with HTTPS. So we have to use a sub-domain of it instead.

Make sure you place the `localhost.crt` and `localhost.key` files in the same folder as this README file.

Once the files are generated, you will need to do the following:

-   Add the certificate (`localhost.crt`) to your local trusted root certs store. How you do
    that depends on your OS. For example, on Windows, you'd open the Certificate Manager tool.
    Simply type `Certificate` in the Start Menu and you should see the tool being suggested.
    Select the `Manager user certificates` suggestion and right-click to the Trusted Root
    Certification Authority. Then select `All Tasks > Import` and import the `localhost.crt`
    file from this folder.
-   Add `app.localhost` as a DNS entry in your `hosts` file. Again, this is also platform
    dependent. For Windows, you'd edit the the `C:\Windows\System32\drivers\etc\hosts` file
    and on macOS/Linux, it's `sudo vi /etc/hosts`. Simply add an entry that looks like the
    following and save the file.

```
127.0.0.1   app.localhost
```

## Installing `npm` Packages

This repo uses Yarn 1.x workspaces. So to install any `npm` package, run the command `yarn add <package name> --cwd app/api` from the root of this repo; not from within this folder.
