import { useState, useEffect } from "react";
export default function SearchBar({ q = "", location = "", onSearch }) {
  const [query, setQuery] = useState(q),
    [place, setPlace] = useState(location);
  useEffect(() => {
    setQuery(q);
    setPlace(location);
  }, [q, location]);
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query, place);
      }}
    >
      <label>
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="Vị trí tuyển dụng, công ty"
          placeholder="Vị trí tuyển dụng, công ty"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <label>
        <span aria-hidden="true">⌖</span>
        <input
          aria-label="Địa điểm"
          placeholder="Địa điểm"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
      </label>
      <button type="submit">⌕ &nbsp; Tìm kiếm</button>
    </form>
  );
}
