import React from "react";
import { withRouter, Route, Switch } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./app.css";
import "./component/nav-menu/navMenu.css";

import CourseDetail from "./component/course-detail/courseDetail";
import CourseList from "./component/course-list/courseList";
import CourseSearch from "./component/course-search/courseSearch";

import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome, faSearch, faCode, faChalkboardTeacher, faArrowDown, faClock} from '@fortawesome/free-solid-svg-icons';
library.add(faHome);
library.add(faSearch);
library.add(faCode);
library.add(faChalkboardTeacher);
library.add(faArrowDown);
library.add(faClock);

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        console.log(this.props.match);
    }

    getTitle() {
        console.log(this.props.location);
        let pathname = this.props.location.pathname;
        if (pathname.includes("/list/most-dropped")) {
            return "Most Dropped Course";
        }
        if (pathname.includes("/list/least-dropped")) {
            return "Least Dropped Course";
        }
        if (pathname.includes("/list/search")) {
            return "Search";
        }
        if (pathname.includes("/course")) {
            let pathList = pathname.split("/");
            // console.log(this.props.match); TODO cant get match here
            return pathList[2] + pathList[3];
        }
    }

    render() {
        return (
            
            <div>
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

                <div className="main-content">
                    <div className="top-section">
                        <button></button><p>{ this.getTitle() }</p>
                    </div>
                    <Switch>
                        <Route path="/course/:code/:section/:session" component={CourseDetail} />         
                        <Route path="/list/search" component={CourseSearch} />                              
                        <Route path="/list/:ordering/:session/:section/:page" component={CourseList} />   
                    </Switch>       
                </div>
            </div>
        );
    }
}

export default withRouter(App);
