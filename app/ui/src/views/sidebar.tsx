import React from "react";
import { Link } from "react-router-dom";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { FaLink } from "react-icons/fa";
export default function Sidebar() {
    return (
        <ProSidebar style={{ marginTop: "-10%", marginLeft: "-1%" }}>
            <div style={{ background: "#0f0c28", paddingBottom:"100%" }}>
                        <p style={{textAlign: "center", marginTop: "10%", fontSize: "25px"}}><FaLink /> Conversica</p>
                <Menu style={{ marginBottom: "160%" }}>
                    <MenuItem>
                        Assistants <Link to="/" />
                    </MenuItem>
                    <div className="linesb"></div>
                    <MenuItem>Skills</MenuItem>
                    <div className="linesb"></div>
                    <MenuItem>Journeys</MenuItem>
                    <div className="linesb"></div>
                </Menu>
            </div>
        </ProSidebar>
    );
}