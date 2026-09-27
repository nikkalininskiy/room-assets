// src/pages/RoomsCatalog.tsx

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  Groups2Outlined,
} from "@mui/icons-material";
import { fetchRooms, type RoomDto } from "@/api/roomsApi";
import { fetchAssets, type AssetDto } from "@/api/assetsApi";

const STATUS_LABEL: Record<string, string> = {
  available: "Доступна",
  booked: "Забронирована",
  maintenance: "На обслуживании",
};

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  available: "success",
  booked: "warning",
  maintenance: "error",
};

const EQUIP_LABEL: Record<string, string> = {
  projector: "Проектор",
  microphone: "Микрофон",
  wifi: "Wi-Fi",
  computers: "Компьютеры",
  board: "Доска",
  whiteboard: "Доска",
};

type TabValue = "rooms" | "assets";

export function RoomsCatalog() {
  const [tab, setTab] = useState<TabValue>("rooms");
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, assetsData] = await Promise.all([
        fetchRooms(),
        fetchAssets(),
      ]);
      setRooms(roomsData.items);
      setAssets(assetsData.items);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация
const filteredRooms = (rooms || []).filter((room) =>
  room.name.toLowerCase().includes(searchQuery.toLowerCase())
);

const filteredAssets = (assets || []).filter((asset) =>
  asset.name.toLowerCase().includes(searchQuery.toLowerCase())
);

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", py: 8 }}
        role="status"
        aria-live="polite"
        aria-label="Загрузка каталога"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }} component="h1">
        Каталог ресурсов
      </Typography>

      {/* Поиск */}
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск по названию..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        inputProps={{ "aria-label": "Поиск ресурсов по названию" }}
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

      {/* Вкладки */}
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        sx={{ mb: 2 }}
        aria-label="Разделы каталога ресурсов"
      >
        <Tab
          label={`Комнаты (${filteredRooms.length})`}
          value="rooms"
          id="catalog-tab-rooms"
          aria-controls="catalog-panel-rooms"
        />
        <Tab
          label={`Активы (${filteredAssets.length})`}
          value="assets"
          id="catalog-tab-assets"
          aria-controls="catalog-panel-assets"
        />
      </Tabs>

      {/* Таблица комнат */}
      {tab === "rooms" && (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2 }}
          role="region"
          aria-labelledby="catalog-tab-rooms"
          id="catalog-panel-rooms"
        >
          <Table size="small" aria-label="Таблица комнат">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell scope="col">Номер</TableCell>
                <TableCell scope="col">Название</TableCell>
                <TableCell scope="col" align="right">Вместимость</TableCell>
                <TableCell scope="col">Оборудование</TableCell>
                <TableCell scope="col">Статус</TableCell>
                <TableCell scope="col" align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      Комнаты не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow key={room.id} hover>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {room.code}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{room.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Groups2Outlined fontSize="small" aria-hidden="true" />
                        <span>{room.capacity}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {room.equipment.map((key) => (
                          <Chip
                            key={key}
                            label={EQUIP_LABEL[key] || key}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {room.equipment.length === 0 && (
                          <Typography variant="caption" color="textSecondary">
                            Нет оборудования
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[room.status] || room.status}
                        size="small"
                        color={STATUS_COLOR[room.status] || "default"}
                        variant={room.status === "maintenance" ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        title="Просмотр"
                        aria-label={`Просмотр комнаты ${room.name}`}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Редактировать"
                        aria-label={`Редактировать комнату ${room.name}`}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Удалить"
                        aria-label={`Удалить комнату ${room.name}`}
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
      )}

      {/* Таблица активов */}
      {tab === "assets" && (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2 }}
          role="region"
          aria-labelledby="catalog-tab-assets"
          id="catalog-panel-assets"
        >
          <Table size="small" aria-label="Таблица активов">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell scope="col">Инвентарный номер</TableCell>
                <TableCell scope="col">Название</TableCell>
                <TableCell scope="col">Статус</TableCell>
                <TableCell scope="col" align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      Активы не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id} hover>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {asset.inventoryCode}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{asset.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[asset.status] || asset.status}
                        size="small"
                        color={STATUS_COLOR[asset.status] || "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        title="Просмотр"
                        aria-label={`Просмотр актива ${asset.name}`}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Редактировать"
                        aria-label={`Редактировать актив ${asset.name}`}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Удалить"
                        aria-label={`Удалить актив ${asset.name}`}
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
      )}
    </Box>
  );
}