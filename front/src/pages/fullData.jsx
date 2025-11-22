import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import MenuBar from '../components/MenuBar';

const FullData = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Sample data - will be replaced with backend data
    const [tableData] = useState([
        { caseId: '1', date: '2025-11-13', type: 'THEFT', time: '18:30', location: '123 Madison, WI' },
        { caseId: '2', date: '2025-11-13', type: 'TRAFFIC', time: '14:20', location: '456 Madison, WI' },
        { caseId: '3', date: '2025-11-12', type: 'PROPERTY', time: '22:15', location: '789  Madison, WI' },
        { caseId: '4', date: '2025-11-12', type: 'VIOLENT', time: '19:45', location: '321 Madison, WI' },
        { caseId: '5', date: '2025-11-11', type: 'THEFT', time: '16:30', location: '654 Madison, WI' },
        { caseId: '6', date: '2025-11-11', type: 'DRUG/ALCOHOL', time: '23:15', location: '987 Madison, WI' },
        { caseId: '7', date: '2025-11-10', type: 'TRAFFIC', time: '08:45', location: '147 Madison, WI' },
        { caseId: '8', date: '2025-11-10', type: 'FIRE', time: '12:00', location: '258  Madison, WI' },
        { caseId: '9', date: '2025-11-09', type: 'EMERGENCY', time: '03:30', location: '369 Madison, WI' },
        { caseId: '10', date: '2025-11-09', type: 'FIRE', time: '17:00', location: '741 Madison, WI' },
        { caseId: '11', date: '2025-11-08', type: 'THEFT', time: '09:15', location: '852 Madison, WI' },
        { caseId: '12', date: '2025-11-08', type: 'PROPERTY', time: '14:00', location: '963 Madison, WI' },
        { caseId: '13', date: '2025-11-07', type: 'VIOLENT', time: '21:30', location: '147 Madison, WI' },
        { caseId: '14', date: '2025-11-07', type: 'TRAFFIC', time: '07:45', location: '258 Madison, WI' },
        { caseId: '15', date: '2025-11-06', type: 'THEFT', time: '16:00', location: '369 Madison, WI' },
        { caseId: '16', date: '2025-11-06', type: 'EMERGENCY', time: '02:15', location: '741 Madison, WI' },
        { caseId: '17', date: '2025-11-05', type: 'FIRE', time: '11:30', location: '852 Madison, WI' },
        { caseId: '18', date: '2025-11-05', type: 'DRUG/ALCOHOL', time: '22:00', location: '963 Madison, WI' },
        { caseId: '19', date: '2025-11-04', type: 'PROPERTY', time: '15:45', location: '147 Madison, WI' },
        { caseId: '20', date: '2025-11-04', type: 'THEFT', time: '10:30', location: '258 Madison, WI' },
        { caseId: '21', date: '2025-11-03', type: 'TRAFFIC', time: '18:15', location: '369 Madison, WI' },
        { caseId: '22', date: '2025-11-03', type: 'VIOLENT', time: '23:45', location: '741 Madison, WI' },
    ]);

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

    const handleBackClick = () => {
        navigate('/');
        setTimeout(() => {
            const dashboardSection = document.querySelector('.dashboard-section');
            if (dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
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

        <button className="back-button" onClick={handleBackClick}>
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
        </button>
        </div>
    );
};

export default FullData;