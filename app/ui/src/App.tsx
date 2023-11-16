import { Route, Link, Routes } from "react-router-dom";
import React from "react";
import { Container } from "react-bootstrap";
import AppDetails from "./views/ApplicationSetup";
import Review from "./views/ReviewSetup";
import Dashboard from "./views/Dashboard";
import Sidebar from "./views/sidebar";
import ConversicaConnect from "./views/ConversicaConnect";

function App() {

    return (
        <div>
            <div>
                <div className="App configs" >
                    <div>
                        <div>
                            <Link to='/ApplicationSetup'></Link>&nbsp;
                            <Link to='/ReviewSetup'></Link>&nbsp;
                            <Link to='/ConversicaConnect'></Link>&nbsp;
                        </div>
                    </div>
                    <Container>
                        <div className="content">
                            <Routes>
                                <Route path='/' element={<AppDetails />} />
                                <Route path='/ReviewSetup' element={<Review />} />
                                <Route path='/ConversicaConnect' element={<ConversicaConnect />} />
                            </Routes>
                        </div>
                    </Container>
                </div>
            </div>
            <div>
                <Routes>
                    <Route path='/Dashboard' element={<Dashboard />} />
                    <Route path='/sidebar' element={<Sidebar />} />
                </Routes>
            </div>
        </div>

    );
}

export default App;
