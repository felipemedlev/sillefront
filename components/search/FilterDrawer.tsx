import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Perfume } from '../../types/perfume';

// Define the structure for active filters, mirroring SearchScreen
interface ActiveFilters {
  brands: number[]; // Use brand IDs
  occasions: number[]; // Use Occasion IDs
  priceRange: { min: number; max: number } | null;
  genders: string[]; // Store backend keys ('male', 'female', 'unisex')
  dayNights: string[]; // Store backend keys ('day', 'night')
  seasons: string[]; // Store backend keys ('winter', 'summer', etc.)
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  initialFilters: ActiveFilters;
  onApplyFilters: (filters: ActiveFilters) => void;
  allBrands: { id: number; name: string }[]; // Expect objects with id and name
  allOccasions: { id: number; name: string }[]; // Expect objects with id and name
  minPrice: number;
  maxPrice: number;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  initialFilters,
  onApplyFilters,
  allBrands,
  allOccasions,
  minPrice,
  maxPrice,
}) => {
  const [tempFilters, setTempFilters] = useState<ActiveFilters>(initialFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    tempFilters.priceRange?.min || minPrice,
    tempFilters.priceRange?.max || maxPrice
  ]);

  // Reset temp filters when drawer opens or initial filters change
  useEffect(() => {
    setTempFilters(initialFilters);
    setPriceRange([
      initialFilters.priceRange?.min ?? minPrice,
      initialFilters.priceRange?.max ?? maxPrice
    ]);
    // console.log("FilterDrawer initialized with filters:", JSON.stringify(initialFilters, null, 2));
  }, [open, initialFilters, minPrice, maxPrice]);

  const handleApply = () => {
    // Update price range in temp filters before applying
    const updatedFilters = {
      ...tempFilters,
      priceRange: priceRange[0] === 0 && priceRange[1] === 0 ? null : {
        min: priceRange[0],
        max: priceRange[1]
      }
    };
    // console.log("FilterDrawer applying filters:", JSON.stringify(updatedFilters, null, 2));
    onApplyFilters(updatedFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: ActiveFilters = {
      brands: [], // Reset to empty array of numbers
      occasions: [], // Reset to empty array of numbers
      priceRange: null, // Reset price range
      genders: [], // Reset to empty array of strings (keys)
      dayNights: [], // Reset to empty array of strings (keys)
      seasons: [], // Reset to empty array of strings (keys)
    };
    setTempFilters(clearedFilters);
    setPriceRange([minPrice, maxPrice]);
  };

  // --- Mappings ---
  const genderMap: { [key: string]: string } = { male: 'Masculino', female: 'Femenino', unisex: 'Unisex' };
  const dayNightMap: { [key: string]: string } = { day: 'Día', night: 'Noche' }; // 'Ambos' not directly mapped to backend key
  const seasonMap: { [key: string]: string } = { winter: 'Invierno', autumn: 'Otoño', spring: 'Primavera', summer: 'Verano' };

  // Generic checkbox group for string options
  const renderStringCheckboxGroup = (title: string, options: string[], selected: string[], onChange: (newSelection: string[]) => void) => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <FormGroup>
          {options.map(option => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={selected.includes(option)}
                  onChange={() => {
                    const newSelection = selected.includes(option)
                      ? selected.filter(item => item !== option)
                      : [...selected, option];
                    onChange(newSelection);
                  }}
                />
              }
              label={option}
            />
          ))}
        </FormGroup>
      </Box>
    );
  };

  // Checkbox group using a map { backendKey: displayName }
  const renderMappedCheckboxGroup = (
    title: string,
    map: { [key: string]: string },
    selectedKeys: string[],
    onChange: (newSelection: string[]) => void
  ) => {
    const options = Object.entries(map); // [ [key, name], [key, name], ... ]
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <FormGroup>
          {options.map(([key, name]) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={selectedKeys.includes(key)}
                  onChange={() => {
                    const newSelection = selectedKeys.includes(key)
                      ? selectedKeys.filter(item => item !== key)
                      : [...selectedKeys, key];
                    onChange(newSelection);
                  }}
                />
              }
              label={name}
            />
          ))}
        </FormGroup>
      </Box>
    );
  };

  // Specific checkbox group for options with ID
  const renderIdCheckboxGroup = (
    title: string,
    options: { id: number; name: string }[],
    selectedIds: number[],
    onChange: (newSelection: number[]) => void
  ) => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <FormGroup>
          {options.map(option => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={selectedIds.includes(option.id)}
                  onChange={() => {
                    const newSelection = selectedIds.includes(option.id)
                      ? selectedIds.filter(id => id !== option.id)
                      : [...selectedIds, option.id];
                    onChange(newSelection);
                  }}
                />
              }
              label={option.name}
            />
          ))}
        </FormGroup>
      </Box>
    );
  };

  const renderPriceRange = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Rango de Precio
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            label="Mínimo"
            type="number"
            value={priceRange[0] === 0 ? '' : priceRange[0]}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Number(e.target.value);
              setPriceRange([value, priceRange[1]]);
            }}
            size="small"
            sx={{ width: '45%' }}
          />
          <TextField
            label="Máximo"
            type="number"
            value={priceRange[1] === 0 ? '' : priceRange[1]}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Number(e.target.value);
              setPriceRange([priceRange[0], value]);
            }}
            size="small"
            sx={{ width: '45%' }}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '85%', sm: 350 },
          p: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filtros</Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ overflow: 'auto', height: 'calc(100%)', marginBottom: 5}}>
        {renderIdCheckboxGroup('Marca', allBrands, tempFilters.brands, (newSelection) =>
          setTempFilters(f => ({ ...f, brands: newSelection }))
        )}

        {renderIdCheckboxGroup('Ocasión', allOccasions, tempFilters.occasions, (newSelection) =>
          setTempFilters(f => ({ ...f, occasions: newSelection }))
        )}

        {renderPriceRange()}

        {renderMappedCheckboxGroup('Género', genderMap, tempFilters.genders, (newSelection) =>
          setTempFilters(f => ({ ...f, genders: newSelection }))
        )}

        {renderMappedCheckboxGroup('Uso (Día/Noche)', dayNightMap, tempFilters.dayNights, (newSelection) =>
          setTempFilters(f => ({ ...f, dayNights: newSelection }))
        )}

        {renderMappedCheckboxGroup('Temporada', seasonMap, tempFilters.seasons, (newSelection) =>
          setTempFilters(f => ({ ...f, seasons: newSelection }))
        )}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 1,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleClear} size="small">
            Limpiar
          </Button>
          <Button variant="contained" onClick={handleApply} size="small">
            Aplicar Filtros
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;