import React from "react";

class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currentPage: 1, currentPagination: [1], maxPage: 1};
    }

    componentDidUpdate(prevProps) {
        if (this.props != prevProps) {
            let numRecords = this.props.numRecords;
            let maxPage = Math.ceil(numRecords/this.props.recordsPerPage);
            let currentPage = this.props.currentPage;
            let currentPagination = this.getDisplayPagination(currentPage, maxPage);

            this.setState({
                currentPage: currentPage,
                currentPagination: currentPagination,
                maxPage: maxPage
            });
        }        
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
        this.props.clickedGotoPage(page);
    }

    render() {
        return (
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
        );
    }
}

export default Pagination;