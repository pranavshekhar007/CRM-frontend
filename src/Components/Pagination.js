import React from "react";

function Pagination({ payload, setPayload, totalCount }) {
  const { pageNo, pageCount } = payload;

  const totalPages = Math.ceil(parseInt(totalCount) / pageCount);

  const startIndex = (pageNo - 1) * pageCount;
  const endIndex = Math.min(startIndex + pageCount, totalCount);

  // handle page number change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setPayload((prev) => ({ ...prev, pageNo: page }));
  };

  // handle page size change
  const handlePageCountChange = (e) => {
    const newPageCount = parseInt(e.target.value);
    setPayload((prev) => ({ ...prev, pageCount: newPageCount, pageNo: 1 }));
  };

  const pageOptions = [10, 20, 30, 50, 100]

  return (
    <div className="pagination-wrapper">
      {/* Left: record summary */}
      <div className="pagination-summary">
        Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of{" "}
        <strong>{totalCount}</strong> users
      </div>

      {/* Right: pagination controls */}
      <div className="pagination-controls">
        {/* Page count dropdown */}
        {totalCount > 10 && (
          <div className="page-count-select">
            <label htmlFor="perPage" className="me-2">
              Show
            </label>
            <select
              id="perPage"
              value={pageCount}
              onChange={handlePageCountChange}
              className="page-select"
            >
              {pageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination buttons */}
        <ul className="pagination-list">
          <li
            className={`pagination-btn ${pageNo === 1 ? "disabled" : ""}`}
            onClick={() => handlePageChange(pageNo - 1)}
          >
            Previous
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li
              key={page}
              className={`pagination-btn ${pageNo === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </li>
          ))}

          <li
            className={`pagination-btn ${pageNo === totalPages ? "disabled" : ""}`}
            onClick={() => handlePageChange(pageNo + 1)}
          >
            Next
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Pagination;
