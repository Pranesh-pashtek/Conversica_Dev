import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Table from 'react-bootstrap/Table';

export default function Dashboard() {


    const [List, setList]: any = useState([]);
    const [isLoad, setIsLoad] = useState(false);


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

    useEffect(() => {
        setIsLoad(true)
        axios({
            method: "post",
            url: "/api/DEcheck",
            data: {
                sfmctoken: sfmctoken,
                subdomain: subdomain,
                SFMC_Clientid: client,
                SFMC_Clientsecret: secret,
                Conversica_Clientid: Concid,
                Conversica_Clientsecret: Concsecret,
            },
        })
            .then((response) => {
                console.log("Destinations::", response);
                axios({
                    method: "post",
                    url: "/api/RetriveDE",
                    data: {
                        sfmctoken: sfmctoken,
                        subdomain: subdomain,
                    },
                })
                    .then(function (response) {
                        console.log("RetriveDE::", response.data);
                        setList(response.data.Data)
                        setIsLoad(false)

                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            })
            .catch(function (error) {
                console.log(error);
            });
    }, [])

    return (
        <div>
            <div style={{ float: "left" }}>
                <Sidebar />
            </div>
            <div className="App" style={{ width: "80%", bottom: "20%" }}>
                <Table style={{ alignItems: "center", width: "77%",textAlignLast:"center" }}>
                    <thead>
                        <tr>
                            {/* <th>#</th> */}
                            <th>Name</th>
                            <th>Skills</th>
                            <th>Type</th>
                            <th>Conversation</th>
                            <th>Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {List.length > 0 ? List?.map((data: any) => (
                            <tr>
                                <td>{data.Name}</td>
                                <td>{data.Skills}</td>
                                <td>{data.Type}</td>
                                <td>{data.Conversation}</td>
                                <td>{data.Contact}</td>
                            </tr>
                        )) : <div className="demo-only demo-only_viewport" style={{ height: "6rem", position: "relative" }}>
                            <div role="status" className="slds-spinner slds-spinner_medium">
                                <span className="slds-assistive-text">Loading</span>
                                <div className="slds-spinner__dot-a"></div>
                                <div className="slds-spinner__dot-b"></div>
                            </div>
                        </div>}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}
