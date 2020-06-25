import React from "react";

import Pagination from "../pagination/pagination";
import inputValidate from "../utility/inputValidate";
import constants from "../utility/constants";

import "./courseList.css";

class CourseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { courses: [], currentPage: 1, numRecords: 0 };

        this.clickedGotoPage = this.clickedGotoPage.bind(this);
        this.clickedCourse = this.clickedCourse.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        const prevParams = prevProps.match.params;
        const params = this.props.match.params;

        if (prevParams != params) {
            this.loadData();
        }
    }

    async loadData() {
        let { match: { params } } = this.props;
        if (this.props.location.pathname === "/") {
            params = constants.defaultCourseListParam;
        }
        if (!inputValidate.isPositiveInteger(params["page"]) || 
                (params["ordering"] !== "most-dropped" && params["ordering"] !== "least-dropped")) {
            return;
        }
        let ordering = params["ordering"] === "most-dropped" ? "DESC":"ASC";
        let response = await fetch("/api/course/list/search?session="+params["session"]+
            "&section="+params["section"]+"&order="+ordering+"&page="+params["page"]);
        let responseJson = await response.json();
        console.log(responseJson);
        if (responseJson["status"] == null || responseJson["status"] !== "success") {
            return;
        }

        let numRecords = parseInt(responseJson["numRecords"]);
        let currentPage = parseInt(params.page);

        this.setState({
            courses: responseJson["courses"],
            currentPage: currentPage,
            numRecords: numRecords
        });
    }

    clickedGotoPage(page) {
        console.log(page);
        let { match: { params } } = this.props;
        if (this.props.location.pathname === "/") {
            params = constants.defaultCourseListParam;
        }
        
        this.props.history.push("/list/" + params["ordering"] + "/" +
            params["session"] + "/" + params["section"] + "/" + page);
    }

    clickedCourse(course) {
        console.log(course);
        this.props.history.push("/course/" + course["code"] + "/" +
            course["section"] + "/" + course["session"]);
    }

    render() {
        return (
            <div>
                <div className="detail-container main-content-pad-top main-content-pad-lr">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="table-top-section">
                                        <div className="row">
                                            <div className="col-7">
                                                <p className="card-title">Drop Rate Overview</p>
                                                <p className="card-subtitle">Only includes courses with more than 30 seats</p>
                                            </div>
                                            <div className="col-5">
                                                <div className="form-group row">
                                                    <label className="col-sm-4 col-form-label">Session:</label>
                                                    <div className="col-sm-8">
                                                        <select name="organization" className="form-control">
                                                            <option value="">20199S</option>                                                   
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Course Code</th>
                                                    <th>Waitlisted</th>
                                                    <th>Enrolled (First day)</th>
                                                    <th>Enrolled (Last day)</th>
                                                    <th>Drop Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.courses.map((course, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td className="course-code" onClick={() => this.clickedCourse(course)}>{course["code"]+course["section"]}</td>
                                                                <td>{course["initial_waitlist"]}</td>
                                                                <td>{course["initial_enrolment"]+"/"+course["enrolment_capacity"]}</td>
                                                                <td>{course["final_enrolment"]+"/"+course["enrolment_capacity"]}</td>
                                                                <td>
                                                                    <span className={(inputValidate.getPercentDrop(course["percent_remaining"]) > 0 ? "c-red":"c-grey")}>
                                                                        -{inputValidate.getPercentDrop(course["percent_remaining"])+"%"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination numRecords={this.state.numRecords} recordsPerPage={10} 
                                        currentPage={this.state.currentPage} clickedGotoPage={this.clickedGotoPage} />          
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CourseList;