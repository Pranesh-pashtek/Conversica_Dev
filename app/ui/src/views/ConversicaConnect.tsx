import React, { useState } from "react";
import { Button } from "@salesforce/design-system-react";
import { Card } from "@salesforce/design-system-react";
import { Input } from "@salesforce/design-system-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { UtilityIcon } from "../components/icons/UtilityIcon";
import logo from "../assets/images/Picture1.png"

export default function ConversicaConnect() {

    const [Conclient, setConclientid] = useState("");
    const [Consecret, setConsecret] = useState("");
    interface CustomisedState {
        client: any;
        secret: any;
        sfmctoken: String;
        subdomain: String;
    }
    const loc = useLocation();
    const state = loc.state as CustomisedState;
    const client = state.client;
    const secret = state.secret;
    const sfmctoken = state.sfmctoken;
    const subdomain = state.subdomain;

    const enableBtn = document.getElementById("enableBtn")!;
    const form1card = document.getElementById("form1card")!;
    const foot1 = document.getElementById("foot1")!;
    const foot2 = document.getElementById("foot2")!;

    const getConcid = (e: any) => {
        setConclientid(e.target.value);
        form1card.style.paddingBottom = "6%";
        foot1.style.display = "none";
        foot2.style.display = "none";
    };
    const getConsecret = (e: any) => {
        setConsecret(e.target.value);
        form1card.style.paddingBottom = "6%";
        foot1.style.display = "none";
        foot2.style.display = "none";
    };

    function showFooter() {
        axios({
            method: "post",
            url: "/api/conversicaauthtoken",
            data: {
                Concid: Conclient,
                Concsecret: Consecret,
            },
        })
            .then(function (response) {

                console.log(
                    "conversicatoken:" + JSON.stringify(response.data)
                );

                enableBtn.style.pointerEvents = "";
                form1card.style.paddingBottom = "0%";
                foot1.style.display = "block";
            })
            .catch(function (error) {
                console.log(error);
                enableBtn.style.pointerEvents = "none";
                form1card.style.paddingBottom = "0%";
                foot2.style.display = "block";
            });
    }

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
                                                        </span>
                                                        <span className="slds-path__title">Connect SFMC S2S Application</span>
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
                                                        <span className="slds-path__title">Connect Conversica API</span>
                                                    </a>
                                                </li>
                                                <li className="slds-path__item slds-is-incomplete" role="presentation">
                                                    <a aria-selected="false" className="slds-path__link" href="javascript:void(0);" id="path-10" role="option" >
                                                        <span className="slds-path__stage">
                                                            <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                                                <use href="/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                                                            </svg>
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
                            <Card id="main-card" heading="" className="slds-text-heading_small  slds-m-left_x-small slds-p-left_x-small slds-truncate" style={{ border: "1px solid #c5c5c5", }}>
                                Conversica API DETAILS
                            </Card>
                            <br></br>
                            <div className="slds-text-heading_small  slds-m-left_x-small slds-p-left_x-small slds-truncate">
                                <p style={{ fontWeight: "500" }}>Please connect with your conversica support team to obtain credentials for the following API Details.</p>
                            </div>
                            <br></br>
                            <form style={{ display: "contents" }}>
                                <div className="slds-clearfix slds-m-top_xxx-large ">
                                    <div className="slds-col slds-size_2-of-6 slds-grid_pull-padded">
                                        <label style={{ display: "contents" }}>

                                            <div className="slds-col_padded">
                                                <div className="slds-col_padded">
                                                    <Input
                                                        aria-describedby="error-4"
                                                        id="unique-id-4"
                                                        required
                                                        onChange={getConcid}
                                                        label="Client ID"
                                                        placeholder="Enter Client ID "
                                                    />
                                                </div>
                                            </div>
                                            <br />
                                            <div className="slds-col_padded slds-m-left_none">
                                                <div className="slds-col_padded">
                                                    <Input
                                                        aria-describedby="error-4"
                                                        id="unique-id-5"
                                                        label="Client Secret"
                                                        required
                                                        placeholder="Enter Secret Key"
                                                        onChange={getConsecret}
                                                    />
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                &nbsp;
                                <br></br>
                                <div className=" slds-col_padded slds-float_right slds-m-top_x-small  slds-m-right_x-small " style={{ float: "left" }} >
                                    <Button
                                        variant="brand"
                                        name="verify"
                                        onClick={showFooter}
                                        className="button12"
                                        required
                                    >
                                        Verify My Account
                                    </Button>
                                </div>
                            </form>

                            <div id="foot1" style={{ paddingBottom: "5%" }}>
                                <div className="slds-notify_container slds-is-relative">
                                    <div className="slds-notify slds-notify_toast slds-theme_success" role="status" style={{ width: "27%" }}>
                                        <span className="slds-assistive-text">error</span>
                                        <span className="slds-icon_container slds-icon-utility-success slds-m-right_small slds-no-flex slds-align-top" title="Description of icon when needed">
                                            <svg className="slds-icon slds-icon_small" aria-hidden="true">
                                            </svg>
                                        </span>
                                        <div className="slds-notify__content">
                                            <h2 className="slds-text-heading_small ">CONVERSICA API SUCCESSFULLY CONNECTED</h2>
                                        </div>
                                        <div className="slds-notify__close">
                                            <Button
                                                onClick={(e: any) => {
                                                    foot1.style.opacity = "0%";
                                                }}
                                                style={{
                                                    background: "fixed",
                                                    border: "none",
                                                }}
                                                className="slds-button  slds-button_icon  slds-button_icon-inverse"
                                                title="Close"
                                            >
                                                <svg className="slds-button__icon slds-button__icon_large" aria-hidden="true">
                                                    <UtilityIcon
                                                        svgClass="slds-button__icon slds-button__icon_large"
                                                        iconName="close"
                                                    />
                                                </svg>
                                                <span className="slds-assistive-text">
                                                    Close
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="foot2" style={{ paddingBottom: "5%" }}>
                                <br></br>
                                <div className="slds-notify_container slds-is-relative">
                                    <div className="slds-notify slds-notify_toast slds-theme_error" role="status">
                                        <span className="slds-assistive-text">error</span>
                                        <span className="slds-icon_container slds-icon-utility-error slds-m-right_small slds-no-flex slds-align-top" title="Description of icon when needed">
                                            <svg className="slds-icon slds-icon_small" aria-hidden="true">
                                            </svg>
                                        </span>
                                        <div className="slds-notify__content">
                                            <h2 className="slds-text-heading_small ">Please enter the valid Conversica credentials.</h2>
                                        </div>
                                        <div className="slds-notify__close">
                                            <Button
                                                onClick={(e: any) => {
                                                    foot2.style.opacity = "0%";
                                                }}
                                                style={{
                                                    background: "fixed",
                                                    border: "none",
                                                }}
                                                className="slds-button  slds-button_icon  slds-button_icon-inverse"
                                                title="Close"
                                            >
                                                <UtilityIcon
                                                    svgClass="slds-button__icon slds-button__icon_large"
                                                    iconName="close"
                                                />
                                                <span className="slds-assistive-text">
                                                    Close
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br></br>
                        <div>
                            <Card hasNoHeader="true" heading="" id="cardfooter">
                                <form>
                                    <Link
                                        className="Button_link1"
                                        to="/"
                                        state={{
                                            Concid: Conclient,
                                            Concsecret: Consecret,
                                            subdomain: subdomain,
                                            sfmctoken: sfmctoken,
                                        }}
                                    >
                                        Back
                                    </Link>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <Link
                                        className="Button_link"
                                        id="enableBtn"
                                        style={{ pointerEvents: "none" }}
                                        to="/ReviewSetup"
                                        state={{
                                            Concid: Conclient,
                                            Concsecret: Consecret,
                                            subdomain: subdomain,
                                            sfmctoken: sfmctoken,
                                            client: client,
                                            secret: secret
                                        }}
                                    >
                                        Next
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
