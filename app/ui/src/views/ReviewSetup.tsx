import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/images/Picture1.png"


export default function Review() {
    interface CustomisedState {
        client: any;
        secret: any;
        sfmctoken: String;
        subdomain: String;
        Concid: String;
        Concsecret: String;
    }
    const loc = useLocation();
    const state = loc.state as CustomisedState;
    const client = state.client;
    const secret = state.secret;
    const Concid = state.Concid;
    const Concsecret = state.Concsecret;
    const sfmctoken = state.sfmctoken;
    const subdomain = state.subdomain;
    return (
        <div style={{ boxSizing: "border-box", paddingTop: "3%" }}>
            <div className="slds-form-element ">
                <div className="slds-m-top_xxx-large">
                    <div className=" slds-box slds-theme_default ">

                        <div className="slds-path">
                            <div className="slds-grid slds-path__track">
                                <div className="slds-grid slds-path__scroller-container">
                                    <div className="slds-path__scroller" role="application">
                                        <div className="slds-path__scroller_inner">
                                            <ul className="slds-path__nav" role="listbox" aria-orientation="horizontal">
                                                <li className="slds-path__item slds-is-current slds-is-active" role="presentation">
                                                    <a aria-selected="true" className="slds-path__link" href="/" id="path-9" role="option" >
                                                        <span className="slds-path__stage">
                                                            <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                                                <use href="/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                                                            </svg>
                                                            <span className="slds-assistive-text">Current Stage:</span>
                                                        </span>
                                                        <span className="slds-path__title">Connect SFMC S2S Application</span>
                                                    </a>
                                                </li>
                                                <li className="slds-path__item slds-is-current slds-is-active" role="presentation">
                                                    <a aria-selected="true" className="slds-path__link" href="/ConversicaConnect" id="path-9" role="option" >
                                                        <span className="slds-path__stage">
                                                            <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                                                <use href="/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                                                            </svg>
                                                            <span className="slds-assistive-text">Current Stage:</span>
                                                        </span>
                                                        <span className="slds-path__title">Connect Conversica API</span>
                                                    </a>
                                                </li>
                                                <li className="slds-path__item slds-is-current slds-is-active" role="presentation">
                                                    <a aria-selected="true" className="slds-path__link" href="javascript:void(0);" id="path-9" role="option" >
                                                        <span className="slds-path__stage">
                                                            <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                                                <use href="/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                                                            </svg>
                                                            <span className="slds-assistive-text">Current Stage:</span>
                                                        </span>
                                                        <span className="slds-path__title">Review Config</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="Set">
                            <div className="image" style={{ textAlign: "start", marginBottom: "12px", border: "1px solid #c5c5c5", borderRadius: "5px", fontStyle: "italic", boxShadow: "0px 5px 5px #cbc9c9" }}>
                                <img src={logo} width={120} />
                                <div className="text" style={{ verticalAlign: "text-top" }}>
                                    <h1 style={{ color: "#78716F", fontWeight: "900", fontSize: "65px", fontFamily: "monospace", marginTop: "-10px" }}>4</h1>
                                    &nbsp;
                                    &nbsp;
                                    <h1 style={{ color: "#FF7D1A", fontWeight: "900", fontSize: "50px", fontFamily: "monospace", fontStyle: "italic" }}>Salesforce</h1>
                                </div>
                            </div>
                        </div>
                        <div
                            id="form1card"
                            className="cardsec form1"
                            style={{ paddingBottom: "6%" }}
                        >
                            <div>
                                <Card.Title id="main-card" style={{ textAlign: "start", marginBottom: "12px", border: "1px solid #c5c5c5", borderRadius: "5px", boxShadow: "0px 5px 5px #cbc9c9", padding: "10px" }}>CONFIGURATION REVIEW</Card.Title>
                                <form>
                                    <div className="slds-clearfix slds-m-top_xxx-large ">
                                        <div>
                                            <label style={{ marginTop: "1%" }}>
                                                <div className="rvw1">
                                                    <p>
                                                        <b className="hed" style={{ fontSize: "large" }}>SFMC Server 2 Server Credentials
                                                        </b>
                                                    </p>
                                                    <p style={{ paddingTop: "2%" }}>CLIENT ID : <b style={{ fontWeight: "500" }}>{client}</b></p>

                                                    <p style={{ paddingTop: "3%" }}>CLIENT SECRET : <b style={{ fontWeight: "500" }}>{secret}</b></p>

                                                    <p style={{ paddingTop: "4%" }}>SUBDOMAIN : <b style={{ fontWeight: "500" }}>{subdomain}</b></p>
                                                    <p style={{ paddingTop: "4%" }}>STATUS  : <b style={{ fontWeight: "500", color: "green" }}>Connected</b></p>

                                                </div>
                                                <div className="rvw2">
                                                    <p>
                                                        <b className="hed" style={{ fontSize: "large" }}>Conversica API Credentials</b>
                                                    </p>
                                                    <p style={{ marginTop: "2%" }}>CLIENT ID : <b style={{ fontWeight: "500" }}>{Concid}</b></p>
                                                    <p style={{ marginTop: "3%" }}>CLIENT SECRET : <b style={{ fontWeight: "500" }}>{Concsecret}</b></p>
                                                    <p style={{ paddingTop: "8%" }}>STATUS  : <b style={{ fontWeight: "500", color: "green" }}>Connected</b></p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <br></br>

                        <div>
                            <Card id="cardfooter">
                                <form>
                                    <Link
                                        className="Button_link1"
                                        to="/ConversicaConnect"
                                        state={{
                                            Concid: Concid,
                                            Concsecret: Concsecret,
                                            subdomain: subdomain,
                                            sfmctoken: sfmctoken,
                                            client: client,
                                            secret: secret,
                                        }}
                                    >
                                        Back
                                    </Link>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <Link className="Button_link" to="/Dashboard"
                                        state={{
                                            Concid: Concid,
                                            Concsecret: Concsecret,
                                            subdomain: subdomain,
                                            sfmctoken: sfmctoken,
                                            client: client,
                                            secret: secret
                                        }}
                                    >
                                        Done
                                    </Link>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
