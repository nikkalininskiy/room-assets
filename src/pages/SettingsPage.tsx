// src/pages/SettingsPage.tsx

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { getAllRecords, clearStore } from "@/lib/db-crud";

export function SettingsPage() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  const showSnackbar = (message: string, severity: "success" | "error" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  // ========== 7.1 ЭКСПОРТ ==========
  const handleExport = async () => {
    setLoading(true);
    try {
      const [rooms, assets, bookings] = await Promise.all([
        getAllRecords("rooms"),
        getAllRecords("assets"),
        getAllRecords("bookings"),
      ]);

      const data = {
        rooms,
        assets,
        bookings,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `room-assets-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSnackbar(
        `Экспортировано: ${rooms.length} комнат, ${assets.length} активов, ${bookings.length} броней`,
        "success"
      );
    } catch (error) {
      showSnackbar(
        error instanceof Error ? error.message : "Ошибка при экспорте",
        "error"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ========== 7.2 ИМПОРТ ==========
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      showSnackbar("Пожалуйста, выберите JSON-файл", "error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // ========== ВАЛИДАЦИЯ СТРУКТУРЫ ==========
        const errors: string[] = [];

        if (!data.rooms) errors.push("Отсутствует секция 'rooms'");
        if (!data.assets) errors.push("Отсутствует секция 'assets'");
        if (!data.bookings) errors.push("Отсутствует секция 'bookings'");

        if (data.rooms && !Array.isArray(data.rooms)) errors.push("'rooms' должен быть массивом");
        if (data.assets && !Array.isArray(data.assets)) errors.push("'assets' должен быть массивом");
        if (data.bookings && !Array.isArray(data.bookings)) errors.push("'bookings' должен быть массивом");

        if (data.rooms && data.rooms.length > 0) {
          const firstRoom = data.rooms[0];
          if (!firstRoom.id || !firstRoom.name) {
            errors.push("Комнаты должны содержать поля 'id' и 'name'");
          }
        }

        if (data.assets && data.assets.length > 0) {
          const firstAsset = data.assets[0];
          if (!firstAsset.id || !firstAsset.name || !firstAsset.inventoryCode) {
            errors.push("Активы должны содержать поля 'id', 'name' и 'inventoryCode'");
          }
        }

        if (data.bookings && data.bookings.length > 0) {
          const firstBooking = data.bookings[0];
          if (!firstBooking.id || !firstBooking.resourceType || !firstBooking.resourceId || !firstBooking.start || !firstBooking.end) {
            errors.push("Брони должны содержать поля 'id', 'resourceType', 'resourceId', 'start', 'end'");
          }
        }

        if (errors.length > 0) {
          showSnackbar(`❌ Ошибки валидации:\n${errors.join("\n")}`, "error");
          event.target.value = "";
          return;
        }

        const confirmMessage =
          `Будет импортировано:\n` +
          `- ${data.rooms.length} комнат\n` +
          `- ${data.assets.length} активов\n` +
          `- ${data.bookings.length} броней\n\n` +
          `Текущие данные будут полностью заменены. Продолжить?`;

        if (!confirm(confirmMessage)) {
          event.target.value = "";
          return;
        }

        setLoading(true);
        await importData(data);

        showSnackbar(
          `✅ Импортировано: ${data.rooms.length} комнат, ${data.assets.length} активов, ${data.bookings.length} броней`,
          "success"
        );

        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        showSnackbar(
          error instanceof Error ? `Ошибка импорта: ${error.message}` : "Ошибка при импорте файла",
          "error"
        );
        console.error(error);
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  // ========== ФУНКЦИЯ ИМПОРТА В INDEXEDDB ==========
  const importData = async (data: {
    rooms: any[];
    assets: any[];
    bookings: any[];
  }) => {
    const { rooms, assets, bookings } = data;

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("RoomAssetsDB");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const clearAndFill = (storeName: string, items: any[]) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          items.forEach((item) => {
            store.put(item);
          });
          resolve();
        };
        clearRequest.onerror = () => reject(clearRequest.error);
        transaction.onerror = () => reject(transaction.error);
      });
    };

    await clearAndFill("rooms", rooms);
    await clearAndFill("assets", assets);
    await clearAndFill("bookings", bookings);

    db.close();
  };

  // ========== ОЧИСТКА ВСЕХ ДАННЫХ ==========
  const handleClearAll = async () => {
    if (!confirm("ВНИМАНИЕ! Это удалит ВСЕ данные (комнаты, активы, брони). Продолжить?")) {
      return;
    }

    if (!confirm("Вы уверены? Данные будут потеряны безвозвратно!")) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        clearStore("rooms"),
        clearStore("assets"),
        clearStore("bookings"),
      ]);
      showSnackbar("Все данные очищены", "info");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showSnackbar("Ошибка при очистке данных", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Настройки
      </Typography>

      {/* Блок управления данными */}
      <Paper sx={{ p: 3, maxWidth: 600, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          📦 Управление данными
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Экспортируйте все данные в JSON-файл или импортируйте ранее сохранённый файл.
        </Typography>

        <Stack spacing={2}>
          {/* 7.1 Кнопка экспорта */}
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
            fullWidth
          >
            {loading ? "Загрузка..." : "📥 Скачать JSON (экспорт)"}
          </Button>

          <Divider>или</Divider>

          {/* 7.2 Кнопка импорта */}
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            component="label"
            disabled={loading}
            fullWidth
          >
            📤 Загрузить JSON (импорт)
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleImport}
            />
          </Button>

          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
              ⚠️ <strong>Внимание:</strong> Импорт полностью заменит все текущие данные.
              Сделайте экспорт перед импортом, чтобы сохранить текущие данные.
            </Typography>
          </Alert>
        </Stack>
      </Paper>

      {/* Блок очистки данных */}
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h6" sx={{ mb: 1, color: "error.main" }}>
          🗑️ Опасная зона
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Удалить все данные из базы данных. Это действие нельзя отменить!
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClearAll}
          disabled={loading}
        >
          Очистить все данные
        </Button>
      </Paper>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}