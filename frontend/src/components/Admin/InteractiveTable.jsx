import React, { useState } from "react";
import "../../styles/InteractiveTable.css";

export default function InteractiveTable({ columns, data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    if (filter) {
      sortableData = sortableData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(filter.toLowerCase())
        )
      );
    }
    return sortableData;
  }, [data, sortConfig, filter]);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  return (
    <div className="interactive-table-container">
      <input
        type="text"
        placeholder="Search..."
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="search-input"
      />

      <table className="styled-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} onClick={() => requestSort(col.key)}>
                {col.header}
                {sortConfig.key === col.key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
          ◀ Prev
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
