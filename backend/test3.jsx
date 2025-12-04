// front/src/pages/fullData.jsx
// 3단계 – FullData에서 incidents_front.json의 table 사용해서 전체 리스트 + 검색 구현

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import MenuBar from '../components/MenuBar';

// URL 쿼리 파라미터 읽는 작은 유틸
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const FullData = () => {
  const navigate = useNavigate();
  const query = useQuery();

  // 메인에서 넘겨준 ?search= 값 초기값으로 사용
  const initialSearch = query.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 1) incidents_front.json 에서 table 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // 백엔드가 front/public/incidents_front.json 로 만들어주는 파일
        // → 브라우저에서는 /incidents_front.json 경로로 접근 가능
        const res = await fetch('/incidents_front.json');
        if (!res.ok) {
          throw new Error('Failed to fetch incidents_front.json');
        }

        const data = await res.json();
        // 우리가 backend에서 넣어준 table 배열 사용
        setTableData(data.table || []);
      } catch (err) {
        setLoadError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // URL 쿼리가 바뀌면 검색어도 동기화
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // 2) 검색어로 필터링
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tableData;

    return tableData.filter((row) => {
      return (
        String(row.id).includes(term) ||
        (row.date && row.date.toLowerCase().includes(term)) ||
        (row.type && row.type.toLowerCase().includes(term)) ||
        (row.time && row.time.toLowerCase().includes(term)) ||
        (row.location && row.location.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, tableData]);

  // 3) 검색 submit 시 URL 쿼리도 같이 업데이트
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    navigate(`/fulldata?${params.toString()}`, { replace: true });
  };

  return (
    <div className="full-data-page">
      <MenuBar />

      <div className="full-data-content">
        <h1 className="full-data-title">Full Incident Dataset</h1>

        {/* 검색 바 */}
        <form className="full-data-search-bar" onSubmit={handleSearchSubmit}>
          <div className="full-data-search-input-wrapper">
            <Search size={18} className="full-data-search-icon" />
            <input
              type="text"
              placeholder="Search by date, type, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="full-data-search-input"
            />
          </div>
          <button type="submit" className="full-data-search-button">
            Search
          </button>
        </form>

        {/* 로딩 / 에러 / 테이블 */}
        {isLoading && (
          <p className="full-data-status">Loading data...</p>
        )}

        {loadError && !isLoading && (
          <p className="full-data-error">
            Failed to load data: {loadError}
          </p>
        )}

        {!isLoading && !loadError && (
          <>
            <p className="full-data-count">
              Showing <strong>{filteredData.length}</strong> of{' '}
              <strong>{tableData.length}</strong> incidents
            </p>

            <div className="full-data-table-wrapper">
              <table className="full-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Time</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.date}</td>
                      <td>{row.type}</td>
                      <td>{row.time}</td>
                      <td>{row.location}</td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="full-data-empty">
                        No incidents match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FullData;
