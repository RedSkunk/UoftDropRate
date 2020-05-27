import React from "react";
import Chart from "chart.js";

import inputValidate from "../utility/inputValidate";
import "./courseDetail.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class CourseDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = { code: "", section: "", courseDescription: "" ,
            initialEnrolment: 1, finalEnrolment: 1, initialWaitlist: 1,
            percentRemaining: 1 };
        
        this.chartRef = React.createRef();
    }

    async componentDidMount() {
        // load data from param
        const { match: { params } } = this.props;

        let response = await fetch("/api/course/" + params["code"] + "/" + 
            params["section"] + "/" + params["session"]);
        let responseJson = await response.json();
        if (responseJson["status"] == null || responseJson["status"] !== "success") {
            return;
        }
        console.log(responseJson);
        
        let course = responseJson["course"];
        this.setState({
            code: course["code"],
            section: course["section"],
            courseDescription: course["course_description"],
            initialEnrolment: course["initial_enrolment"], 
            finalEnrolment: course["final_enrolment"], 
            initialWaitlist: course["initial_waitlist"],
            percentRemaining: course["percent_remaining"]
        });

        // process data and draw graph
        let totalEnrolmentHistorys = this.getTotalEnrolmentHistorys(responseJson["enrolmentHistorys"], 
            responseJson["lectures"]);
        console.log(totalEnrolmentHistorys);
        let labelDataset = this.convertToLabelDataset(totalEnrolmentHistorys);
        console.log(labelDataset);
        this.drawGraph(labelDataset[0], labelDataset[1], labelDataset[2])
    }

    drawGraph(dates, enrolmentData, waitlistData) {
        const myChartRef = this.chartRef.current.getContext("2d");

        new Chart(myChartRef, {
            type: "line",
            data: {
                labels: dates,
                datasets: [
                    {
                        label: "Enrolment",
                        data: enrolmentData,
                        fill: false,
                        pointBackgroundColor: "white",
                        borderColor: "#4099dc"
                    },
                    {
                        label: "Waitlist",
                        data: waitlistData,
                        fill: false,
                        pointBackgroundColor: "white",
                        borderColor: "#f37372"
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        type: 'time',
                    }]
                }
            }
        });
    }

    getTotalEnrolmentHistorys(enrolmentHistorys, lectures) {
        let totalEnrolmentHistorys = [];

        let currentLecEnrolment = {};
        let currentLecWaitlist = {};
        let currentTotalEnrolment = 0;
        let currentTotalWaitlist = 0;

        // 1 course has multiple lecture
        // we combine them to get the total enrolment for the whole course
        // in currentTotal
        for (const lecture of lectures) {
            currentLecEnrolment[lecture["id"]] = parseInt(lecture["first_actual_enrolment"]);
            currentTotalEnrolment += parseInt(lecture["first_actual_enrolment"]);

            currentLecWaitlist[lecture["id"]] = parseInt(lecture["first_actual_waitlist"]);
            currentTotalWaitlist += parseInt(lecture["first_actual_waitlist"]);
        }        
        
        // if the the current history item has a new date
        // add or subtract from the currentTotal and append a data point to the graph
        let currentDate = enrolmentHistorys[0]["date"];
        let currentEnrolDiff = 0;
        let currentWaitDiff = 0;
        for (const enrolmentHistory of enrolmentHistorys) {
            // add or subtract the difference
            // once a data point is created, 
            // start counting again from 0 from this date
            if ( currentDate != enrolmentHistory["date"] && 
                    (currentEnrolDiff != 0 || currentWaitDiff != 0) ) {
                currentTotalEnrolment += currentEnrolDiff;
                currentTotalWaitlist += currentWaitDiff;
                totalEnrolmentHistorys.push({ "enrolment": currentTotalEnrolment, 
                    "waitlist": currentTotalWaitlist, "date": new Date(currentDate) });

                currentEnrolDiff = 0;
                currentWaitDiff = 0;
                currentDate = enrolmentHistory["date"];
            }
            let lectureId = enrolmentHistory["lecture_id"];
            let enrolment = parseInt(enrolmentHistory["actual_enrolment"]);
            let waitlist = parseInt(enrolmentHistory["actual_waitlist"]);

            // tally up the difference, wait for when a new date has arrived
            if (currentLecEnrolment[lectureId] != enrolment) {
                currentEnrolDiff -= (currentLecEnrolment[lectureId] - enrolment);
                currentLecEnrolment[lectureId] = enrolment;
            }

            if (currentLecWaitlist[lectureId] != waitlist) {
                currentWaitDiff -= (currentLecWaitlist[lectureId] - waitlist);
                currentLecWaitlist[lectureId] = waitlist;
            }
        }
        return totalEnrolmentHistorys;
    }

    // labels is the list for x axis
    // datasets are the data point on the graph
    convertToLabelDataset(totalEnrolmentHistorys) {
        let labels = [];
        let datasetEnrol = [];
        let datasetDrop = [];
        for (const totalEnrolmentHistory of totalEnrolmentHistorys) {
            labels.push(totalEnrolmentHistory["date"]);
            datasetEnrol.push(totalEnrolmentHistory["enrolment"]);
            if (totalEnrolmentHistory["waitlist"] !== 0) {
                datasetDrop.push(totalEnrolmentHistory["waitlist"]);
            }
        }
        datasetDrop.push(0);

        return [labels, datasetEnrol, datasetDrop];
    }

    render() {
        return (
            <div>
                
                <div className="detail-container main-content-pad-top main-content-pad-lr">
                    <div className="row">
                    
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="misc-heading">Description</h5>
                                    <p className="misc-desc">{ this.state.courseDescription }</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 col-xl-8">
                            <div className="card">
                                <div className="main-graph-container">
                                    <canvas
                                        id="myChart"
                                        ref={this.chartRef}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 col-xl-4">
                            <div className="card graph-info-card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <p>Drop Rate</p>
                                            <p>{ this.state.initialEnrolment } -> { this.state.finalEnrolment }
                                                <span className={"change-percent " + 
                                                        (inputValidate.getPercentDrop(this.state.percentRemaining) > 0 ? "c-red":"c-grey")}>
                                                    -{inputValidate.getPercentDrop(this.state.percentRemaining)}%
                                                </span>
                                            </p>
                                            <div className="progress">
                                                <div className="progress-bar bg-c-blue" style={
                                                    {width: (100-inputValidate.getPercentDrop(this.state.percentRemaining))+"%"}}></div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <FontAwesomeIcon className="graph-info-icon bg-c-blue" icon={['fas', 'arrow-down']} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card graph-info-card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <p>Waitlisted</p>
                                            <p>{this.state.initialWaitlist}</p>
                                        </div>
                                        <div className="col-auto">
                                            <FontAwesomeIcon className="graph-info-icon bg-c-yellow" icon={['fas', 'clock']} />
                                        </div>
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

export default CourseDetail;
