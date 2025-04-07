import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Box,
} from '@mui/material';

interface CustomPageSizeSelectorProps {
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (newPageSize: number) => void;
}

const CustomPageSizeSelector: React.FC<CustomPageSizeSelectorProps> = ({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  const [customValue, setCustomValue] = useState<string | number>("");

  const handleCustomValueSubmit = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (Number(customValue) > 100) {
      alert((" value should be less than 100"));
    } else {
      if (e.key === "Enter" && customValue) {
        const newSize = Number(customValue);
        if (!isNaN(newSize) && newSize > 0) {
          onPageSizeChange(newSize);
          setCustomValue(""); // Reset the input field
        }
      }
    }
  };

  return (
    <Box display="flex" alignItems="center">
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
        <InputLabel id="page-size-select-label">Rows per page</InputLabel>
        <Select
          labelId="page-size-select-label"
          id="page-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          label="Rows per page"
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        variant="outlined"
        size="small"
        placeholder="Custom size"
        value={customValue}
        onChange={(e) => setCustomValue(e.target.value)}
        onKeyDown={handleCustomValueSubmit}
        sx={{ maxWidth: 120 }}
      />
    </Box>
  );
};

export default CustomPageSizeSelector;
