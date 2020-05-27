import React from "react";
import inputValidate from "../utility/inputValidate";

import "./courseList.css";

class CourseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { courses: [], currentPage: 1, maxPage: 1, currentPagination: [1] };

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
        const { match: { params } } = this.props;
        if (!inputValidate.isPositiveInteger(params["page"]) || 
                (params["ordering"] !== "most-dropped" && params["ordering"] !== "least-dropped")) {
            return;
        }
        let ordering = params["ordering"] === "most-dropped" ? "DESC":"ASC";
        let response = await fetch("/api/course/list/search?session="+params["session"]+
            "&section="+params["section"]+"&order="+ordering+"&page="+params["page"]);
        let responseJson = await response.json();
        if (responseJson["status"] == null || responseJson["status"] !== "success") {
            return;
        }
        console.log(responseJson);

        let numRecords = parseInt(responseJson["numRecords"]);
        let maxPage = Math.ceil(numRecords/10);
        let page = parseInt(params.page);
        let paginationList = this.getDisplayPagination(page, maxPage);
        if (paginationList === null) {
            paginationList = this.getDisplayPagination(1, numRecords);
        }
        console.log(paginationList);

        this.setState({
            courses: responseJson["courses"],
            currentPage: page,
            maxPage: maxPage,
            currentPagination: paginationList
        });
    }

    getDisplayPagination(currentPage, maxPage) {
        let paginationList = [currentPage];
        let remainingLen = 9-1;
        
        let leftOffset = 0;
        let rightOffset = 0;
        while ( (currentPage-leftOffset >= 1 || currentPage+rightOffset <= maxPage) && 
                remainingLen > 0) {
            leftOffset += 1;
            if (currentPage-leftOffset >= 1 && remainingLen > 0) {
                paginationList.unshift(currentPage-leftOffset);
                remainingLen -= 1;
            }

            rightOffset += 1;
            if (currentPage+rightOffset <= maxPage && remainingLen > 0) {
                paginationList.push(currentPage+rightOffset);
                remainingLen -= 1;
            }   
        }

        return paginationList;
    }

    clickedGotoPage(page) {
        console.log(page);
        const { match: { params } } = this.props;
        
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
                                        <p className="card-title">Drop Rate Overview</p>
                                        <p className="card-subtitle">Only includes courses with more than 30 seats</p>
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
                                    <div className="table-pagination">
                                        <nav aria-label="Page navigation example">
                                            <ul className="pagination">
                                                <li className={"page-item " + (this.state.currentPage === 1 ? "disabled":"")}>
                                                    <a className="page-link" href="#" aria-label="Previous"
                                                        onClick={(e) => {e.preventDefault();this.clickedGotoPage(this.state.currentPage-1)}}>
                                                        <span aria-hidden="true">&laquo;</span>
                                                        <span className="sr-only">Previous</span>
                                                    </a>
                                                </li>
                                                {
                                                    this.state.currentPagination.map((value) => {
                                                        return (
                                                            <li key={value} className={"page-item " + 
                                                                (value === this.state.currentPage ? "active":"")}>
                                                                <a className="page-link" href="#" 
                                                                        onClick={(e) => {e.preventDefault();this.clickedGotoPage(value)}}>
                                                                    {value}
                                                                </a>
                                                            </li>
                                                        );
                                                    })
                                                }
                                                <li className={"page-item " + (this.state.currentPage === this.state.maxPage ? "disabled":"")}>
                                                    <a className="page-link" href="#" aria-label="Next" 
                                                            onClick={(e) => {e.preventDefault();this.clickedGotoPage(this.state.currentPage+1)}}>
                                                        <span aria-hidden="true">&raquo;</span>
                                                        <span className="sr-only">Next</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>            
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