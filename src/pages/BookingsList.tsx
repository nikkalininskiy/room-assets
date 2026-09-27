// src/pages/BookingsList.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { fetchBookings, deleteBooking, type BookingDto } from "@/api/bookingsApi";
import { fetchRooms, type RoomDto } from "@/api/roomsApi";
import { fetchAssets, type AssetDto } from "@/api/assetsApi";
import { BookingForm } from "@/components/BookingForm";
import { formatLocalTime } from "@/lib/booking-utils";

type ResourceType = "room" | "asset";

export function BookingsList() {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResourceType, setFilterResourceType] = useState<ResourceType | "all">("all");
  const [filterResourceId, setFilterResourceId] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingDto | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, roomsData, assetsData] = await Promise.all([
        fetchBookings(),
        fetchRooms(),
        fetchAssets(),
      ]);
      setBookings(bookingsData.items);
      setRooms(roomsData.items);
      setAssets(assetsData.items);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту бронь?")) return;
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      showSnackbar("Бронь удалена", "success");
    } catch (error) {
      showSnackbar("Ошибка при удалении", "error");
    }
  };

  const handleEdit = (booking: BookingDto) => {
    setEditingBooking(booking);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingBooking(null);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingBooking(null);
    loadData();
    showSnackbar(
      editingBooking ? "Бронь обновлена" : "Бронь создана",
      "success"
    );
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const getResourceName = (resourceType: ResourceType, resourceId: string): string => {
    if (resourceType === "room") {
      const room = rooms.find((r) => r.id === resourceId);
      return room?.name || resourceId;
    } else {
      const asset = assets.find((a) => a.id === resourceId);
      return asset?.name || resourceId;
    }
  };

const filteredBookings = (bookings || []).filter((booking) => {
    const matchesSearch =
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesType =
      filterResourceType === "all" || booking.resourceType === filterResourceType;
    const matchesResource =
      filterResourceId === "all" || booking.resourceId === filterResourceId;
    return matchesSearch && matchesType && matchesResource;
  });

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", py: 8 }}
        role="status"
        aria-live="polite"
        aria-label="Загрузка списка броней"
      >
        <CircularProgress />
      </Box>
    );
  }

  const availableResources = [
    ...rooms.map((r) => ({ id: r.id, name: r.name, type: "room" as const })),
    ...assets.map((a) => ({ id: a.id, name: a.name, type: "asset" as const })),
  ];

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Управление бронированием
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          aria-label="Создать новую бронь"
        >
          Создать бронь
        </Button>
      </Stack>

      {/* Фильтры */}
      <Paper
        sx={{ p: 2, mb: 2 }}
        component="section"
        aria-label="Фильтры броней"
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            size="small"
            placeholder="Поиск по названию или примечанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
            inputProps={{ "aria-label": "Поиск броней по названию или примечанию" }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon aria-hidden="true" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="filter-type-label">Тип</InputLabel>
            <Select
              labelId="filter-type-label"
              id="filter-type"
              value={filterResourceType}
              label="Тип"
              onChange={(e) => {
                setFilterResourceType(e.target.value as ResourceType | "all");
                setFilterResourceId("all");
              }}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="room">Комнаты</MenuItem>
              <MenuItem value="asset">Активы</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-resource-label">Ресурс</InputLabel>
            <Select
              labelId="filter-resource-label"
              id="filter-resource"
              value={filterResourceId}
              label="Ресурс"
              onChange={(e) => setFilterResourceId(e.target.value)}
              disabled={filterResourceType === "all"}
            >
              <MenuItem value="all">Все</MenuItem>
              {availableResources
                .filter((r) => filterResourceType === "all" || r.type === filterResourceType)
                .map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Таблица броней */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small" aria-label="Таблица броней">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell scope="col">Название</TableCell>
              <TableCell scope="col">Ресурс</TableCell>
              <TableCell scope="col">Начало</TableCell>
              <TableCell scope="col">Конец</TableCell>
              <TableCell scope="col">Примечание</TableCell>
              <TableCell scope="col" align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    Брони не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{booking.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={booking.resourceType === "room" ? "Комната" : "Актив"}
                        size="small"
                        color={booking.resourceType === "room" ? "primary" : "secondary"}
                      />
                      <Typography variant="body2">
                        {getResourceName(booking.resourceType, booking.resourceId)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatLocalTime(booking.start)}</TableCell>
                  <TableCell>{formatLocalTime(booking.end)}</TableCell>
                  <TableCell>
                    {booking.notes ? (
                      <Typography variant="body2" color="textSecondary">
                        {booking.notes}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      title="Редактировать"
                      aria-label={`Редактировать бронь ${booking.title}`}
                      onClick={() => handleEdit(booking)}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      title="Удалить"
                      aria-label={`Удалить бронь ${booking.title}`}
                      onClick={() => handleDelete(booking.id)}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модальное окно с формой */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="booking-dialog-title"
      >
        <DialogTitle id="booking-dialog-title">
          {editingBooking ? "Редактирование брони" : "Создание брони"}
        </DialogTitle>
        <DialogContent>
          <BookingForm
            initialData={editingBooking || undefined}
            rooms={rooms}
            assets={assets}
            existingBookings={bookings}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          role="alert"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}