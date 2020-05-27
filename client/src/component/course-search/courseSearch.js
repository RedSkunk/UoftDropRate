import React from "react";
import queryString from 'query-string';

import inputValidate from "../utility/inputValidate";

class CourseSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = { courses: [], currentPage: 1, maxPage: 1, currentPagination: [1], 
            organizations: [{name:"CSC"}], 
            code: "", organization: "", session: "20199", section: "S" };

        this.clickedGotoPage = this.clickedGotoPage.bind(this);
        this.clickedCourse = this.clickedCourse.bind(this);
        this.clickedSearch = this.clickedSearch.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {        
        this.loadOrganizations();
        this.loadData();
    }

    // this page has pagination, we will load again if the page changed
    componentDidUpdate(prevProps) {
        const prevParams = prevProps.location.search;
        const params = this.props.location.search;

        if (prevParams != params) {
            this.loadData();
        }
    }

    // this is used for "Departments" in the search bar
    async loadOrganizations() {
        let response = await fetch("/api/organization");
        let responseJson = await response.json();
        if (responseJson["status"] == null || responseJson["status"] !== "success") {
            return;
        }
        this.setState({ organizations: responseJson["organizations"]});
    }

    async loadData() {
        const queryParam = queryString.parse(this.props.location.search);
        console.log(queryParam);
        let code = queryParam.code == null ? "":queryParam.code;
        let organization = queryParam.department == null ? "":queryParam.department;
        let session = queryParam.session == null ? "":queryParam.session;
        let section = queryParam.section == null ? "":queryParam.section;
        let page = queryParam.page == null ? "":queryParam.page;
        console.log("/api/course/list/search?code="+code+
            "&department="+organization+"&session="+session+"&section="+section+
            "&page="+page);
        let response = await fetch("/api/course/list/search?code="+code+
            "&department="+organization+"&session="+session+"&section="+section+
            "&page="+page);
        let responseJson = await response.json();
        if (responseJson["status"] == null || responseJson["status"] !== "success") {
            return;
        }
        console.log(responseJson);

        let numRecords = parseInt(responseJson["numRecords"]);
        let maxPage = Math.ceil(numRecords/10);
        let pageInt = parseInt(page);
        let paginationList = this.getDisplayPagination(pageInt, maxPage);
        if (paginationList === null) {
            paginationList = this.getDisplayPagination(1, numRecords);
        }
        console.log(paginationList);

        this.setState({
            courses: responseJson["courses"],
            currentPage: pageInt,
            maxPage: maxPage,
            currentPagination: paginationList
        });
    }

    // this determines how many items is to the left or right in pagination
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
        const queryParam = queryString.parse(this.props.location.search);
        let code = queryParam.code == null ? "":queryParam.code;
        let department = queryParam.department == null ? "":queryParam.department;
        let session = queryParam.session == null ? "":queryParam.session;
        let section = queryParam.section == null ? "":queryParam.section;
        
        this.props.history.push("/list/search?code="+code+
            "&department="+department+"&session="+session+"&section="+section+
            "&page="+page);
    }

    clickedCourse(course) {
        console.log(course);
        this.props.history.push("/course/" + course["code"] + "/" +
            course["section"] + "/" + course["session"]);
    }

    clickedSearch() {
        this.props.history.push("/list/search?code="+this.state.code+
            "&department="+this.state.organization+"&session="+this.state.session+
            "&section="+this.state.section+"&page="+1);
    }

    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        return (
            <div>
                <div className="detail-container main-content-pad-top main-content-pad-lr">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body">
                                <div className="row">
                                        <div className="col-xl-6 col-md-12">
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Course Code:</label>
                                                <div className="col-sm-8">
                                                    <input name="code" type="text" className="form-control" 
                                                        placeholder="e.g. CSC108H1" value={this.state.code} onChange={this.handleInputChange} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-6 col-md-12">
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Department:</label>
                                                <div className="col-sm-8">
                                                    <select name="organization" className="form-control" 
                                                            value={this.state.organization} onChange={this.handleInputChange}>
                                                        <option value="">Any</option>
                                                        {
                                                            this.state.organizations.map((value) => <option key={value.name} value={value.name}>{value.name}</option>)
                                                        }                                                        
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-5 col-md-12">
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Year:</label>
                                                <div className="col-sm-8">
                                                    <select name="session" className="form-control"
                                                            value={this.state.session} onChange={this.handleInputChange}>
                                                        <option value="20199">20199</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-5 col-md-12">
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Session:</label>
                                                <div className="col-sm-8">
                                                    <select name="section" className="form-control"
                                                            value={this.state.section} onChange={this.handleInputChange}>
                                                        <option value="S">S</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-2 col-md-12 mb-3">
                                            <button type="button" className="btn btn-primary" onClick={this.clickedSearch}>Search</button>
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

export default CourseSearch;