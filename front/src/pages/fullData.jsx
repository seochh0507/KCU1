import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import MenuBar from '../components/MenuBar';

const FullData = () => {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Sample data - will be replaced with backend data
    const [tableData] = useState([
        { caseId: '2025-00447776', date: '2025-11-13', type: 'THEFT', time: '18:30', location: '123 State Street, Madison, WI' },
        { caseId: '2025-00447890', date: '2025-11-13', type: 'TRAFFIC', time: '14:20', location: '456 University Ave, Madison, WI' },
        { caseId: '2025-00448012', date: '2025-11-12', type: 'PROPERTY', time: '22:15', location: '789 Park Street, Madison, WI' },
        { caseId: '2025-00448156', date: '2025-11-12', type: 'VIOLENT', time: '19:45', location: '321 Johnson Street, Madison, WI' },
        { caseId: '2025-00448234', date: '2025-11-11', type: 'THEFT', time: '16:30', location: '654 Langdon Street, Madison, WI' },
        { caseId: '2025-00448345', date: '2025-11-11', type: 'DRUG/ALCOHOL', time: '23:15', location: '987 Gorham Street, Madison, WI' },
        { caseId: '2025-00448456', date: '2025-11-10', type: 'TRAFFIC', time: '08:45', location: '147 East Washington Ave, Madison, WI' },
        { caseId: '2025-00448567', date: '2025-11-10', type: 'FIRE', time: '12:00', location: '258 West Mifflin Street, Madison, WI' },
        { caseId: '2025-00448678', date: '2025-11-09', type: 'EMERGENCY', time: '03:30', location: '369 North Hamilton Street, Madison, WI' },
        { caseId: '2025-00448789', date: '2025-11-09', type: 'FIRE', time: '17:00', location: '741 South Carroll Street, Madison, WI' },
        { caseId: '2025-00448890', date: '2025-11-08', type: 'THEFT', time: '09:15', location: '852 East Main Street, Madison, WI' },
        { caseId: '2025-00448901', date: '2025-11-08', type: 'PROPERTY', time: '14:00', location: '963 West Dayton Street, Madison, WI' },
        { caseId: '2025-00449012', date: '2025-11-07', type: 'VIOLENT', time: '21:30', location: '147 North Lake Street, Madison, WI' },
        { caseId: '2025-00449123', date: '2025-11-07', type: 'TRAFFIC', time: '07:45', location: '258 South Park Street, Madison, WI' },
        { caseId: '2025-00449234', date: '2025-11-06', type: 'THEFT', time: '16:00', location: '369 East Johnson Street, Madison, WI' },
        { caseId: '2025-00449345', date: '2025-11-06', type: 'EMERGENCY', time: '02:15', location: '741 West Gorham Street, Madison, WI' },
        { caseId: '2025-00449456', date: '2025-11-05', type: 'FIRE', time: '11:30', location: '852 North Frances Street, Madison, WI' },
        { caseId: '2025-00449567', date: '2025-11-05', type: 'DRUG/ALCOHOL', time: '22:00', location: '963 South Hamilton Street, Madison, WI' },
        { caseId: '2025-00449678', date: '2025-11-04', type: 'PROPERTY', time: '15:45', location: '147 East Mifflin Street, Madison, WI' },
        { caseId: '2025-00449789', date: '2025-11-04', type: 'THEFT', time: '10:30', location: '258 West Johnson Street, Madison, WI' },
        { caseId: '2025-00449890', date: '2025-11-03', type: 'TRAFFIC', time: '18:15', location: '369 North Park Street, Madison, WI' },
        { caseId: '2025-00449901', date: '2025-11-03', type: 'VIOLENT', time: '23:45', location: '741 South Lake Street, Madison, WI' },
    ]);

    // Check for search query in URL on mount
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch) {
        setSearchQuery(urlSearch);
        performSearch(urlSearch);
        } else {
        setFilteredData(tableData);
        }
    }, [searchParams, tableData]);

    const performSearch = (query) => {
        if (query.trim() === '') {
        setFilteredData(tableData);
        setActiveSearch('');
        setCurrentPage(1);
        return;
        }

        const searchTerm = query.toLowerCase();
        const results = tableData.filter(row => 
        row.caseId.toLowerCase().includes(searchTerm) ||
        row.date.toLowerCase().includes(searchTerm) ||
        row.type.toLowerCase().includes(searchTerm) ||
        row.time.toLowerCase().includes(searchTerm) ||
        row.location.toLowerCase().includes(searchTerm)
        );

        setFilteredData(results);
        setActiveSearch(query);
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const handleSearch = () => {
        performSearch(searchQuery);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
        handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setActiveSearch('');
        setFilteredData(tableData);
        setCurrentPage(1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="fulldata-container">
        <MenuBar />
        <div className="fulldata-content">
            <div className="fulldata-header">
            <div className="search-box-minimal">
                <Search size={18} className="search-icon" />
                <input
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input-minimal"
                />
                {searchQuery && (
                <button className="search-clear-minimal" onClick={clearSearch}>
                    X
                </button>
                )}
            </div>
            </div>

            {activeSearch && (
            <p className="search-results-message">
                Showing results for "{activeSearch}"
            </p>
            )}

            <div className="table-wrapper">
            <table className="data-table-minimal">
                <thead>
                <tr>
                    <th>Case ID</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Time</th>
                    <th>Location</th>
                </tr>
                </thead>
                <tbody>
                {currentData.length > 0 ? (
                    currentData.map((row, index) => (
                    <tr key={index}>
                        <td>{row.caseId}</td>
                        <td>{row.date}</td>
                        <td>{row.type}</td>
                        <td>{row.time}</td>
                        <td>{row.location}</td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="5" className="no-results">
                        No results found for "{activeSearch}"
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

            {/* Pagination */}
            {filteredData.length > rowsPerPage && (
            <div className="pagination">
                <button 
                className="pagination-btn" 
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                >
                <ChevronLeft size={20} />
                </button>
                <span className="pagination-info">
                {currentPage} / {totalPages}
                </span>
                <button 
                className="pagination-btn" 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                >
                <ChevronRight size={20} />
                </button>
            </div>
            )}
        </div>
        </div>
    );
};

export default FullData;