// front/src/pages/fullData.jsx
// 3단계 – FullData에서 incidents_front.json의 table 사용해서 전체 리스트 + 검색 구현

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuBar from '../components/MenuBar';

// URL 쿼리스트링 (?search=...) 쉽게 읽기 위한 작은 훅
const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const FullData = () => {
  const query = useQuery();
  const initialSearch = query.get('search') || '';

  const [rows, setRows] = useState([]);          // incidents_front.json.table
  const [searchText, setSearchText] = useState(initialSearch);
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [error, setError] = useState(null);      // 에러 메시지용

  // 1) 페이지가 처음 렌더링될 때 incidents_front.json 한 번 fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/incidents_front.json');
        if (!res.ok) {
          throw new Error(`Failed to load incidents_front.json (status: ${res.status})`);
        }

        const data = await res.json();
        // 우리가 백엔드에서 만든 구조: { totalIncidents, stats, table, rawItems }
        const table = Array.isArray(data.table) ? data.table : [];
        setRows(table);
      } catch (err) {
        console.error('Error loading incidents_front.json:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 2) 검색 필터: date / type / location 에서 검색어 찾기
  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
      const date = (row.date || '').toLowerCase();
      const type = (row.type || '').toLowerCase();
      const location = (row.location || '').toLowerCase();
      const time = (row.time || '').toLowerCase();

      return (
        date.includes(q) ||
        type.includes(q) ||
        location.includes(q) ||
        time.includes(q)
      );
    });
  }, [rows, searchText]);

  return (
    <div className="full-data-page">
      <MenuBar />

      <div className="full-data-container">
        <h1 className="full-data-title">Full Incident Dataset</h1>

        {/* 검색 박스 */}
        <div className="full-data-search-container">
          <input
            type="text"
            placeholder="Search by date, type, time, or location"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="full-data-search-input"
          />
        </div>

        {/* 로딩 / 에러 / 테이블 */}
        {loading && <p className="full-data-info">Loading data...</p>}
        {error && <p className="full-data-error">{error}</p>}

        {!loading && !error && (
          <>
            <p className="full-data-count">
              Showing <strong>{filteredRows.length}</strong> of{' '}
              <strong>{rows.length}</strong> incidents
            </p>

            <div className="table-wrapper">
              <table className="data-table">
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
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="no-results">
                        No results found for “{searchText}”
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.date}</td>
                        <td>{row.type}</td>
                        <td>{row.time}</td>
                        <td>{row.location}</td>
                      </tr>
                    ))
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
