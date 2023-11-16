import https from "https";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import xml2js from "xml2js";
import express, { NextFunction, Request, Response } from "express";

import axios from "axios";
import jwt from "jsonwebtoken";

// Middleware
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
// import csurf from "csurf";
import ejs from "ejs";
import morgan from "morgan";

import { AccessTokenResponse } from "sfmc";

import { getAppConfig, getAppPort, isDev } from "./config";
import {
    getCookieOptions,
    ONE_HOUR_IN_SECONDS,
    TWENTY_MINS_IN_SECONDS,
} from "./cookies";
import { clientErrorHandler, errorHandler } from "./errors";


const __dirname = dirname(fileURLToPath(import.meta.url));
// Make sure we initialize the app config from the env vars
// as early as possible.
const appConfig = getAppConfig();
const sfmcOAuthCallbackPath = "/oauth2/sfmc/callback";

// The API path where the customer's OAuth service should
// redirect the user to with the authorization code.

const defaultAxiosClient = axios.create();
const app = express();
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
// Set the EJS `renderFile` function as the view render
// function for HTML files. This allows us to use EJS
// inside files with the .html extension instead of .ejs.
app.engine("html", ejs.renderFile);

// Add the request logging middleware.
// Use the `dev` predefined format for local development purposes
// so that we get colored log output, but for all other times
// use the `common` format which following the Apache log
// format.
app.use(morgan(isDev() ? "dev" : "common"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    bodyParser.json({
        type: [
            "application/json",
        ],
    })
);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                frameAncestors: [
                    "https://*.exacttarget.com",
                    "https://*.marketingcloudapps.com",
                ],
                connectSrc: [
                    "'self'",
                    "https://*.marketingcloudapis.com/",
                ],
            },
        },
    })
);

app.use(cookieParser(appConfig.cookieSecret));

// app.use(
//     csurf({
//         cookie: {
//             httpOnly: true,
//             sameSite: "none",
//             secure: !isDev(),
//             signed: true,
//         },
//         value: (req) => req.signedCookies["XSRF-Token"],
//     })
// );

app.use("/assets", express.static(join(__dirname, "dist/ui")));

// Setup the error handling middlewares last.
app.use(clientErrorHandler);
app.use(errorHandler);

app.get(
    "/oauth2/sfmc/authorize",
    async (_req: Request, res: Response, next: NextFunction) => {
        console.log("Auth test:::");
        const authUrl = new URL(
            `https://${appConfig.sfmcDefaultTenantSubdomain}.auth.marketingcloudapis.com/v2/authorize`
        );
        authUrl.searchParams.append("client_id", appConfig.sfmcClientId);
        authUrl.searchParams.append(
            "redirect_uri",
            `${appConfig.selfDomain}${sfmcOAuthCallbackPath}`
        );
        authUrl.searchParams.append("response_type", "code");

        try {
            // Generate a signed string that can be validated in the callback.
            const state = jwt.sign({}, appConfig.jwtSecret, {
                expiresIn: "10m",
            });
            authUrl.searchParams.append("state", state);

            res.redirect(authUrl.toString());
            return;
        } catch (err) {
            console.error("Failed to create a signed JWT. ", err);
        }

        next(
            new Error(
                "An error occurred while generating the authorization URL."
            )
        );
    }
);

async function verifyOAuth2Callback(
    req: Request,
    next: NextFunction
): Promise<string | undefined> {
    const code = req.query.code as string;
    console.log("Code:::", code);
    if (!code) {
        console.error("SFMC OAuth callback didn't have the code query-param");
        next(new Error("invalid_request: Missing code param"));
        return;
    }

    const state = req.query.state as string;
    if (!state) {
        console.error("SFMC OAuth callback didn't have the state query-param");
        next(new Error("invalid_request: Missing state param"));
        return;
    }

    try {
        await new Promise((resolve, reject) => {
            jwt.verify(
                state as string,
                appConfig.jwtSecret,
                {
                    algorithms: ["HS256"],
                },
                (err, decoded) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(decoded);
                }
            );
        });
    } catch (err) {
        console.error("Unable to verify the state param.", err);
        next(new Error("invalid_request: Invalid state param"));
        return;
    }

    return code;
}

app.get(
    sfmcOAuthCallbackPath,
    async (req: Request, res: Response, next: NextFunction) => {
        const code = await verifyOAuth2Callback(req, next);
        const tssd = req.query.tssd || appConfig.sfmcDefaultTenantSubdomain;
        const resp = await defaultAxiosClient.post<AccessTokenResponse>(
            `https://${tssd}.auth.marketingcloudapis.com/v2/token`,
            {
                grant_type: "authorization_code",
                code,
                client_id: appConfig.sfmcClientId,
                client_secret: appConfig.sfmcClientSecret,
                redirect_uri: `${appConfig.selfDomain}${sfmcOAuthCallbackPath}`,
            }
        );
        console.log("Response:", resp.data);
        const accessTokenResp = resp.data;
        res.cookie(
            "sfmc_access_token",
            accessTokenResp.access_token,
            getCookieOptions(TWENTY_MINS_IN_SECONDS)
        );
        res.cookie(
            "sfmc_refresh_token",
            accessTokenResp.refresh_token,
            getCookieOptions(ONE_HOUR_IN_SECONDS)
        );

        res.cookie("sfmc_tssd", tssd, getCookieOptions(TWENTY_MINS_IN_SECONDS));

        res.redirect("/");
    }
);

app.post(
    "/oauth2/sfmc/refresh_token",
    async (req: Request, res: Response, next: NextFunction) => {
        console.log("Request::", JSON.stringify(req));
        if (
            !req.signedCookies["sfmc_tssd"] ||
            !req.signedCookies["sfmc_refresh_token"]
        ) {
            res.status(401).send();
            return;
        }

        const tssd = req.signedCookies["sfmc_tssd"];
        const refreshToken = req.signedCookies["sfmc_refresh_token"];
        console.log("Refresh Token >> ", refreshToken);

        try {
            const resp = await defaultAxiosClient.post<AccessTokenResponse>(
                `https://${tssd}.auth.marketingcloudapis.com/v2/token`,
                {
                    grant_type: "refresh_token",
                    client_id: appConfig.sfmcClientId,
                    client_secret: appConfig.sfmcClientSecret,
                    refresh_token: refreshToken,
                }
            );
            console.log("Respo::", resp);
            const accessTokenResp = resp.data;
            res.cookie(
                "sfmc_access_token",
                accessTokenResp.access_token,
                getCookieOptions(TWENTY_MINS_IN_SECONDS)
            );
            res.cookie(
                "sfmc_tssd",
                tssd,
                getCookieOptions(TWENTY_MINS_IN_SECONDS)
            );
            res.cookie(
                "sfmc_refresh_token",
                accessTokenResp.refresh_token,
                getCookieOptions(ONE_HOUR_IN_SECONDS)
            );

            res.status(200).send();
        } catch (err: any) {
            if (
                err.response?.data &&
                err.response.data.error === "invalid_token"
            ) {
                console.error(err.response.data);
                res.status(401).send();
                return;
            }
            console.error("Failed to refresh SFMC token", err);
            next(err);
        }
    }
);

app.post(
    "/oauth2/sfmc/refresh_token",
    async (req: Request, res: Response, next: NextFunction) => {
        console.log("Request::", JSON.stringify(req));
        if (
            !req.signedCookies["sfmc_tssd"] ||
            !req.signedCookies["sfmc_refresh_token"]
        ) {
            res.status(401).send();
            return;
        }

        const tssd = req.signedCookies["sfmc_tssd"];
        const refreshToken = req.signedCookies["sfmc_refresh_token"];
        console.log("Refresh Token >> ", refreshToken);

        try {
            const resp = await defaultAxiosClient.post<AccessTokenResponse>(
                `https://${tssd}.auth.marketingcloudapis.com/v2/token`,
                {
                    grant_type: "refresh_token",
                    client_id: appConfig.sfmcClientId,
                    client_secret: appConfig.sfmcClientSecret,
                    refresh_token: refreshToken,
                }
            );
            console.log("Respo::", resp);
            const accessTokenResp = resp.data;
            res.cookie(
                "sfmc_access_token",
                accessTokenResp.access_token,
                getCookieOptions(TWENTY_MINS_IN_SECONDS)
            );
            res.cookie(
                "sfmc_tssd",
                tssd,
                getCookieOptions(TWENTY_MINS_IN_SECONDS)
            );
            res.cookie(
                "sfmc_refresh_token",
                accessTokenResp.refresh_token,
                getCookieOptions(ONE_HOUR_IN_SECONDS)
            );

            res.status(200).send();
        } catch (err: any) {
            if (
                err.response?.data &&
                err.response.data.error === "invalid_token"
            ) {
                console.error(err.response.data);
                res.status(401).send();
                return;
            }
            console.error("Failed to refresh SFMC token", err);
            next(err);
        }
    }
);


app.post(
    "/api/RetriveDE",
    async (req: Request, res: Response, _next: NextFunction) => {
         let soapMessage =
         '<?xml version="1.0" encoding="UTF-8"?>' +
         '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
         "    <s:Header>" +
         '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
         '        <a:To s:mustUnderstand="1">' +
         `https://${req.body.subdomain}.soap.marketingcloudapis.com/Service.asmx` +
         "</a:To>" +
         '        <fueloauth xmlns="http://exacttarget.com">' +
         req.body.sfmctoken +
         "</fueloauth>" +
         "    </s:Header>" +
         '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
         '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
         "            <RetrieveRequest>" +
         "                <ObjectType>DataExtensionObject[Conversica]</ObjectType>" +
         "      <Properties>Name</Properties>" +
         "      <Properties>Skills</Properties>" +
         "      <Properties>Conversation</Properties>" +
         "      <Properties>Type</Properties>" +
         "      <Properties>Contact</Properties>" +
         "            </RetrieveRequest>" +
         "        </RetrieveRequestMsg>" +
         "    </s:Body>" +
         "</s:Envelope>";
          //let _self = this;
        try {
            
            const resp = await defaultAxiosClient.post(
                `https://${req.body.subdomain}.soap.marketingcloudapis.com/Service.asmx`,
                
                soapMessage,{
                headers: {
                    "Content-Type": "text/xml",
                },
        });
            console.log('RetriveDE::'+resp.data);
            const resData = xmlToArray(resp.data,'DEvalue');
            console.log("RetriveDE Name::"+JSON.stringify(resData));
            res.status(200).send(JSON.stringify( {Data:resData} ));
            console.log({resData},"**********************************************************************************************************");
            
        } catch (err: any) {
            console.log(err);
            res.status(err.response.status).send();
        }
    }
);

app.post(
    "/api/DEcheck",
    async (req: Request, res: Response, _next: NextFunction) => {
         let soapMessage =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
          "    <s:Header>" +
          '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
          '        <a:To s:mustUnderstand="1">https://' +
          req.body.subdomain +
          ".soap.marketingcloudapis.com/Service.asmx" +
          "</a:To>" +
          '        <fueloauth xmlns="http://exacttarget.com">' +
          req.body.sfmctoken +
          "</fueloauth>" +
          "    </s:Header>" +
          '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
          '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          "            <RetrieveRequest>" +
          "                <ObjectType>DataExtension</ObjectType>" +
          "                <Properties>ObjectID</Properties>" +
          "                <Properties>CustomerKey</Properties>" +
          "                <Properties>Name</Properties>" +
          '                <Filter xsi:type="SimpleFilterPart">' +
          "                    <Property>Name</Property>" +
          "                    <SimpleOperator>equals</SimpleOperator>" +
          "                    <Value>testDE</Value>" +
          "                </Filter>" +
          "            </RetrieveRequest>" +
          "        </RetrieveRequestMsg>" +
          "    </s:Body>" +
          "</s:Envelope>";
          //let _self = this;
        try {
            
            const resp = await defaultAxiosClient.post(
                `https://${req.body.subdomain}.soap.marketingcloudapis.com/Service.asmx`,
                
                soapMessage,{
                headers: {
                    "Content-Type": "text/xml",
                },
        });
            //console.log('success DE'+resp.data);
            const resData = xmlToArray(resp.data,'DErow');
            console.log("resData::"+resData);
            
            if (resData != undefined || resData != null) {
                console.log
                let DEresponse = InsertDE( req.body.subdomain,req.body.sfmctoken,req.body.SFMC_Clientid,req.body.SFMC_Clientsecret,req.body.Conversica_Clientid,req.body.Conversica_Clientsecret);
                console.log('DEresponse::'+DEresponse);
                res.status(200).send(JSON.stringify(DEresponse));
            }else{
                let mid = await getuserinfo (req.body.subdomain,req.body.sfmctoken);
                console.log('memberid::'+mid);
                let DEcreate = await createDE(req.body.subdomain,req.body.sfmctoken,mid);
                console.log('DEcreate::'+DEcreate);
                let DEresponse = InsertDE( req.body.subdomain,req.body.sfmctoken,req.body.SFMC_Clientid,req.body.SFMC_Clientsecret,req.body.Conversica_Clientid,req.body.Conversica_Clientsecret);
                console.log('DEresponse::'+DEresponse);
                res.status(200).send(JSON.stringify(DEresponse));
            }   
        } catch (err: any) {
            console.log(err);
            res.status(err.response.status).send();
        }
    }
);

async function createDE(subdomain:any,access_token:any,memberid:any){
    let deName = 'testDE';
    let DCmsg =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
          "    <s:Header>" +
          '        <a:Action s:mustUnderstand="1">Create</a:Action>' +
          '        <a:To s:mustUnderstand="1">https://' +
          subdomain +
          ".soap.marketingcloudapis.com/Service.asmx" +
          "</a:To>" +
          '        <fueloauth xmlns="http://exacttarget.com">' +
          access_token +
          "</fueloauth>" +
          "    </s:Header>" +
          '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
          '        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          '            <Objects xsi:type="DataExtension">' +
          "                <Client>" +
          '<ID>'+
          memberid +
          '</ID>'+
          "</Client>" +
          "                <CustomerKey>" +
          deName +
          "</CustomerKey>" +
          "                <Name>" +
          deName +
          "</Name>" +
          "                <Fields>" +
          "                    <Field>" +
          "                        <CustomerKey>SFMC Client ID</CustomerKey>" +
          "                        <Name>SFMC Client ID</Name>" +
          "                        <FieldType>Text</FieldType>" +
          "                        <MaxLength>100</MaxLength>" +
          "                        <IsRequired>false</IsRequired>" +
          "                        <IsPrimaryKey>false</IsPrimaryKey>" +
          "                    </Field>" +
          "                    <Field>" +
          "                        <CustomerKey>SFMC Client Secret</CustomerKey>" +
          "                        <Name>SFMC Client Secret</Name>" +
          "                        <FieldType>Text</FieldType>" +
          "                        <MaxLength>100</MaxLength>" +
          "                        <IsRequired>false</IsRequired>" +
          "                        <IsPrimaryKey>false</IsPrimaryKey>" +
          "                    </Field>" +
          "                    <Field>" +
          "                        <CustomerKey>SFMC Subdomain</CustomerKey>" +
          "                        <Name>SFMC Subdomain</Name>" +
          "                        <FieldType>Text</FieldType>" +
          "                        <MaxLength>100</MaxLength>" +
          "                        <IsRequired>true</IsRequired>" +
          "                        <IsPrimaryKey>true</IsPrimaryKey>" +
          "                    </Field>" +
          "                    <Field>" +
          "                        <CustomerKey>Conversica Client ID</CustomerKey>" +
          "                        <Name>Conversica Client ID</Name>" +
          "                        <FieldType>Text</FieldType>" +
          "                        <MaxLength>100</MaxLength>" +
          "                        <IsRequired>false</IsRequired>" +
          "                        <IsPrimaryKey>false</IsPrimaryKey>" +
          "                    </Field>" +
          "                    <Field>" +
          "                        <CustomerKey>Conversica Client Secrect</CustomerKey>" +
          "                        <Name>Conversica Client Secrect</Name>" +
          "                        <FieldType>Text</FieldType>" +
          "                        <MaxLength>100</MaxLength>" +
          "                        <IsRequired>false</IsRequired>" +
          "                        <IsPrimaryKey>false</IsPrimaryKey>" +
          "                    </Field>" +
          "                </Fields>" +
          "            </Objects>" +
          "        </CreateRequest>" +
          "    </s:Body>" +
          "</s:Envelope>";

        return new Promise<any>((resolve, reject) => {
          let headers = {
            "Content-Type": "text/xml",
          };

          console.log("DCmsg in creating folder:",DCmsg);
          axios({
            method: "post",
            url:`https://${subdomain}.soap.marketingcloudapis.com/Service.asmx`,
            data: DCmsg,
            headers: headers,
          })
            .then((response: any) => {
              //console.log("Create Folder from Domain Confug:",response)
              var parser = new xml2js.Parser();
              parser.parseString(
                response.data,
                (
                  err: any,
                  result: {
                    [x: string]: {
                      [x: string]: { [x: string]: { [x: string]: any }[] }[];
                    };
                  }
                ) => {
                  let DEcheck =
                    result["soap:Envelope"]["soap:Body"][0][
                      "CreateResponse"
                    ][0]["Results"];

                  if (DEcheck != undefined) {
                    let DEexternalKeyDomainConfiguration =
                      DEcheck[0]["Object"][0]["CustomerKey"];

                    console.log('DEexternalKeyDomainConfiguration::'+DEexternalKeyDomainConfiguration)
                    resolve(JSON.stringify(DEexternalKeyDomainConfiguration));
                  }else{
                    console.log('err'+err);
                  }
                }
              );
            })
            .catch((error: any) => {
              // error
              let errorMsg = "Error creating the Data extension......";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response
                  ? error.response.status
                  : "<None>";
              errorMsg += "\nResponse data: " + error.response.data;

              reject(errorMsg);
            });
        });
}

function InsertDE(subdomain:any,access_token:any,SFMC_Clientid:any,SFMC_Clientsecret:any,Conversica_Clientid:any,Conversica_Clientsecret:any){
    let key = 'testDE';
    let postData = [{
        "keys": {
            "SFMC Subdomain":subdomain,
        },
        "values":{                        
                "SFMC Client ID":SFMC_Clientid,
                "SFMC Client Secret":SFMC_Clientsecret,
                "Conversica Client ID":Conversica_Clientid,
                "Conversica Client Secrect":Conversica_Clientsecret
    },
    }]
    console.log('subdomain::'+subdomain);
    console.log('access_token::'+access_token);;
    return new Promise<any>((resolve, reject) => {
        axios({
          method: "post",
          url: `https://${subdomain}.rest.marketingcloudapis.com//hub/v1/dataevents/key:${key}/rowset`,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
          },
          data: postData,
        })
          .then(function (response: any) {
             console.log("Event Definition:", JSON.stringify(response.data));
             resolve(response.data);
          })
          .catch(function (error: any) {
            console.log(error);
            reject(error);
          });
      });
}

function xmlToArray(rawResponse: any, Retrivedata:any) {
    let data;
    var parser = new xml2js.Parser();
    parser.parseString(rawResponse, (err: any, result: any) => {
      if (
        result["soap:Envelope"]["soap:Body"][0].RetrieveResponseMsg[0]
          .Results !== undefined && Retrivedata =='DErow'
      ) {
        const rows =
          result["soap:Envelope"]["soap:Body"][0].RetrieveResponseMsg[0]
            .Results[0].CustomerKey;
          data = rows;
        
      } else if(result["soap:Envelope"]["soap:Body"][0].RetrieveResponseMsg[0]
      .Results !== undefined && Retrivedata =='DEvalue'){
        const rows =
          result["soap:Envelope"]["soap:Body"][0].RetrieveResponseMsg[0]
            .Results;
        if (rows.length >= 0) {
          const element = [];
          let index;
          for (index = 0; index < rows.length; index++) {
            const aux = rows[index].Properties[0].Property;

            const obj = {
                Name: "",
                Skills: "",
                Conversation: "",
                Type: "",
                Contact: "",
            };

            for (let j = 0; j < aux.length; j++) {
              const row = aux[j];

              if (row.Name[0] === "Name") {
                obj.Name = row.Value[0];
              }

              if (row.Name[0] === "Skills") {
                obj.Skills = row.Value[0];
              }

              if (row.Name[0] === "Conversation") {
                obj.Conversation = row.Value[0];
              }

              if (row.Name[0] === "Type") {
                obj.Type = row.Value[0];
              }

              if (row.Name[0] === "Contact") {
                obj.Contact = row.Value[0];
              }
            }
            element.push(obj);
          }
          data = element;
        }
      }
      else{
        console.log(err);
      }
    });
    return data;
  }

app.post(
    "/api/appdemoauthtoken",
    async (req: Request, res: Response, _next: NextFunction) => {
        let data = {
            grant_type: "client_credentials",
            client_id: req.body.cid,
            client_secret: req.body.csecret,
        };
        try {
            const resp = await defaultAxiosClient.post(
                `https://${req.body.subdomain}.auth.marketingcloudapis.com/v2/token`,
                
                data,{
                headers: {
                    "Content-Type": "application/json",
                },
        });
            res.status(200).send(resp.data);
        } catch (err: any) {
            console.log(err);
            res.status(err.response.status).send();
        }
    }
);

app.post(
    "/api/conversicaauthtoken",
    async (req: Request, res: Response, _next: NextFunction) => {
        let data = {
            grant_type: "client_credentials",
            client_id: req.body.Concid,
            client_secret: req.body.Concsecret,
            audience: "https://api.conversica.com/",
        };
        try {
            const resp = await defaultAxiosClient.post(
                `https://authentication.conversica.com/oauth/token`,
                
                data,{
                headers: {
                    "Content-Type": "application/json",
                },
        });
            res.status(200).send(resp.data);
        } catch (err: any) {
            console.log(err);
            res.status(err.response.status).send();
        }
    }
);

async function getuserinfo(subdomain:any,access_token:any){
     return new Promise<any>((resolve,reject) => {
        console.log('subdomain::'+subdomain);
        console.log('access_token::'+access_token);
        axios({
          method: "get",
          url: `https://${subdomain}.auth.marketingcloudapis.com/v2/userinfo`,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
          },
        })
          .then(function (response: any) {
             console.log("userinfo", JSON.stringify(response.data.organization.member_id));
             resolve(JSON.stringify(response.data.organization.member_id));
          })
          .catch(function (error: any) {
            console.log(error);
            reject(error);
          });
      });
}

/* commented
app.get("/api/destinations", async (_req: Request, res: Response) => {
    console.log("URL Hit::");
    try {
        const resp = await defaultAxiosClient.get(
            `https://api..io/api/v1/destinations?orderBy=id`,
            {
                headers: {
                    Authorization:
                        "Bearer eba8870f-973a-42f1-bfcb-9c2dda808be4",
                },
            }
        );
        console.log("Response:", resp.data);
        res.status(200).send(resp.data);
    } catch (error: any) {
        console.log(error);
        res.status(error.response.status).send();
    }
});

app.get("/api/syncs", async (_req: Request, res: Response) => {
    try {
        const resp = await defaultAxiosClient.get(
            `https://api..io/api/v1/syncs?orderBy=id`,
            {
                headers: {
                    Accept: "application/json",
                    Authorization:
                        "Bearer eba8870f-973a-42f1-bfcb-9c2dda808be4",
                },
            }
        );
        console.log("Response:", resp.data);
        res.status(200).send(resp.data);
    } catch (error: any) {
        console.log(error);
        res.status(error.response.status).send();
    }
});

app.post("/api/connect", async (req: Request, _res: Response) => {
    console.log('Api Connect ::')
    console.log('Request::',req.body)
   
      var data = JSON.stringify({
        "accountId": "abc123678901",
        "userId": "ABC123456781",
        "email": "my@email.com",
        "resources": {
          "subdomain": "mcj6cy1x9m-t5h5tz0bfsyqj38ky",
          "clientId": "ctnkfhspslyort3f10p7odst",
          "clientSecret": "tMhhbnNOn0lXGPJjwuaoV7Qn"
        }
      });
      
      var config = {
        method: 'post',
        url: 'https://api..io/api/partner-connect/v1/sfmc/connect',
        headers: { 
          'Authorization': 'Basic c2ZtYzp3eEVHQnRDb1VNOXR5VDBvOXNCaA==', 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios(config)
      .then(function (response) {
        console.log('Response in Connect:',JSON.stringify(response.data));
        _res.status(200).send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
           
});*/

app.get("/oauth2/error", (req: Request, _res: Response, next: NextFunction) => {
    console.error(
        "Redirected to /oauth2/error while handling:",
        req.headers.referer
    );
    // Call the next() method with an error and let the error handler middleware
    // take care of writing the error response.
    next(new Error());
});

app.get("/logout", (_req: Request, res: Response) => {
    res.clearCookie("sfmc_access_token");
    res.clearCookie("sfmc_refresh_token");
    res.clearCookie("sfmc_tssd");
    res.clearCookie("XSRF-Token");

    res.status(200).send("You have been successfully logged out!");
});

app.get("/*", (_req: Request, res: Response) => {
    // let token = req.csrfToken()
    // console.log("XCRF Token ::",token)
    // res.cookie("XSRF-Token", req.csrfToken(), getCookieOptions());

    if (isDev() && appConfig.redirectUiToLocalhost) {
        console.log("Redirecting to localhost...");
        res.redirect("https://app.localhost:3000");
        return;
    }
    res.sendFile(join(__dirname, "ui", "index.html"));
});

const port = getAppPort();

if (isDev()) {
    console.log("Starting HTTPS server for local development");
    const options = {
        key: readFileSync(join(__dirname, "..", "localhost.key")),
        cert: readFileSync(join(__dirname, "..", "localhost.crt")),
    };
    https.createServer(options, app).listen(443);
} else {
    app.listen(port, () => console.log(`Listening on port ${port}`));
}