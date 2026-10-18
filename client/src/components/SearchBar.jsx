import React, { useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";

export const SearchBar = ({ onSearch, initialTitle = "", initialLocation = "" }) => {
  const [title, setTitle] = useState(initialTitle);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ title, location });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hero-search-box">
      {/* Title / Skill Input */}
      <div className="search-input-group">
        <Search size={19} />
        <input
          type="text"
          placeholder="Job title, skill (e.g. React, Java, MERN, Python)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Location Input */}
      <div className="search-input-group">
        <MapPin size={19} />
        <input
          type="text"
          placeholder="City (e.g. Bangalore, Pune, Mumbai, Hyderabad, Remote)..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary"
        style={{ padding: "0.75rem 1.85rem", fontSize: "0.95rem" }}
      >
        <span>Search Jobs</span>
        <ArrowRight size={16} />
      </button>
    </form>
  );
};
