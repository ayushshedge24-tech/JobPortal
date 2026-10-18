import React from "react";
import { Search } from "lucide-react";
import { Input } from "./Input";

export const SearchInput = React.forwardRef(
  ({ placeholder = "Search...", value, onChange, onClear, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        clearable={Boolean(onClear)}
        onClear={onClear}
        startIcon={<Search size={18} />}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
