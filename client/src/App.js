import React from "react";
import { withRouter, Route, Switch } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./app.css";
import ".//navMenu.css";

import CourseDetail from "./component/course-detail/courseDetail";
import CourseList from "./component/course-list/courseList";
import CourseSearch from "./component/course-search/courseSearch";

import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faSortAmountDownAlt, faSortAmountUp, faSearch, faTimes, 
    faArrowDown, faClock, } from '@fortawesome/free-solid-svg-icons';

// menu
library.add(faBars);
library.add(faSortAmountDownAlt);
library.add(faSortAmountUp);
library.add(faSearch);
library.add(faTimes)

// detail
library.add(faArrowDown);
library.add(faClock);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showMenuMobile: false };

        this.clickedShowMenu = this.clickedShowMenu.bind(this);
        this.clickedCloseMenu = this.clickedCloseMenu.bind(this);
    }

    getTitle() {
        console.log(this.props.location);
        let pathname = this.props.location.pathname;
        if (pathname.startsWith("/list/most-dropped")) {
            return "Most Dropped Course";
        }
        if (pathname.startsWith("/list/least-dropped")) {
            return "Least Dropped Course";
        }
        if (pathname.startsWith("/list/search")) {
            return "Search";
        }
        if (pathname.startsWith("/course")) {
            let pathList = pathname.split("/");
            // console.log(this.props.match); TODO cant get match here
            return pathList[2] + pathList[3];
        }
        if (pathname === "/") {
            return "Most Dropped Course";
        }
        return "Page Not Found";
    }

    clickedShowMenu() {
        this.setState({ showMenuMobile: true });
    }

    clickedCloseMenu() {
        this.setState({ showMenuMobile: false });
    }

    render() {
        return (
            
            <div>
                <div className={"menu-container " + (this.state.showMenuMobile ? "show-menu-mobile":"")}>
                    <div className="top-section menu-section">
                        <p>UofTDropRate</p>
                        <button className="menu-button" onClick={this.clickedCloseMenu}>
                            <FontAwesomeIcon icon={['fas', 'times']} />
                        </button>
                    </div>
                    <div className="menu-button-group menu-section">
                        
                        <NavLink to="/list/most-dropped/20199/S/1" activeClassName="selected" className="menu-button" 
                                isActive={(match, location) => location.pathname.startsWith("/list/most-dropped/") || location.pathname === "/" }>
                            <FontAwesomeIcon className="menu-button-icon" icon={['fas', 'sort-amount-up']} />
                            Most Dropped
                        </NavLink>
                        <NavLink to="/list/least-dropped/20199/S/1" activeClassName="selected" className="menu-button"
                                isActive={(match, location) => location.pathname.startsWith("/list/least-dropped/")}>
                            <FontAwesomeIcon className="menu-button-icon" icon={['fas', 'sort-amount-down-alt']} />
                            Least Dropped
                        </NavLink>
                        <NavLink to="/list/search" activeClassName="selected" className="menu-button" 
                                isActive={(match, location) => location.pathname.startsWith("/list/search") || location.pathname.includes("/course")}>
                            <FontAwesomeIcon className="menu-button-icon" icon={['fas', 'search']} />
                            Search
                        </NavLink>
                    </div>
                    
                    {/* <div className="bottom-section menu-section">
                        <p>Data last updated on DD/MM/YYYY</p>
                    </div> */}
                </div>

                <div className="main-content">
                    <div className="top-section">
                        <button className="menu-button" onClick={this.clickedShowMenu}>
                            <FontAwesomeIcon icon={['fas', 'bars']} />
                        </button>
                        
                        <p>{ this.getTitle() }</p>
                    
                        <Route path="/course/:code/:section/:session" component={() => (
                            <div className="row">
                                <label className="col-4 col-form-label">Session:</label>
                                <div className="col-8">
                                    <select name="session" className="form-control">
                                        <option value="">20199S</option>                                                   
                                    </select>
                                </div>
                            </div>
                        )} /> 
                        
                                
                    </div>
                    <Switch>
                        <Route path="/course/:code/:section/:session" component={CourseDetail} />         
                        <Route path="/list/search" component={CourseSearch} />                              
                        <Route path="/list/:ordering/:session/:section/:page" component={CourseList} /> 
                        <Route exact path="/" component={CourseList} />   
                    </Switch>       
                </div>
            </div>
        );
    }
}

export default withRouter(App);
