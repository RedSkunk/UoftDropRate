import React from "react";
import "./navMenu.css";
import { withRouter, NavLink } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class NavMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="menu-container">
                <div className="top-section menu-section">
                    <p>UofTDropRate</p>
                </div>
                <div className="menu-button-group menu-section">
                    
                    <NavLink to="/list/most-dropped/20199/S/1" activeClassName="selected" className="menu-button" 
                            isActive={(match, location) => location.pathname.includes("/list/most-dropped/20199/S/")}>
                        <FontAwesomeIcon className="menu-button-icon" icon={['fas', 'code']} />
                        Most Dropped
                    </NavLink>
                    <NavLink to="/list/least-dropped/20199/S/1" activeClassName="selected" className="menu-button"
                            isActive={(match, location) => location.pathname.includes("/list/least-dropped/20199/S/")}>
                        <FontAwesomeIcon className="menu-button-icon" icon={['fas', 'chalkboard-teacher']} />
                        Least Dropped
                    </NavLink>
                    <NavLink to="/list/search" activeClassName="selected" className="menu-button" 
                            isActive={(match, location) => location.pathname.includes("/list/search")||location.pathname.includes("/course")}>
                        <FontAwesomeIcon className="menu-button-icon" icon={['fas', 'search']} />
                        Search
                    </NavLink>
                </div>
                
                {/* <div className="bottom-section menu-section">
                    <p>Data last updated on DD/MM/YYYY</p>
                </div> */}
            </div>
        );
    }
}

export default withRouter(NavMenu);
