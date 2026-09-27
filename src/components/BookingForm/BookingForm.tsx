// src/components/BookingForm/BookingForm.tsx

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  FormHelperText,
} from "@mui/material";
import { createBooking, updateBooking, type BookingDto } from "@/api/bookingsApi";
import { checkOverlap, isValidTimeRange } from "@/lib/booking-utils";
import type { RoomDto } from "@/api/roomsApi";
import type { AssetDto } from "@/api/assetsApi";

interface BookingFormProps {
  initialData?: BookingDto;
  rooms: RoomDto[];
  assets: AssetDto[];
  existingBookings: BookingDto[];
  onSuccess: () => void;
  onCancel: () => void;
}

type ResourceType = "room" | "asset";

export function BookingForm({
  initialData,
  rooms,
  assets,
  existingBookings,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    resourceType: initialData?.resourceType || ("room" as ResourceType),
    resourceId: initialData?.resourceId || "",
    title: initialData?.title || "",
    start: initialData?.start || "",
    end: initialData?.end || "",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<{
    resourceId?: string;
    title?: string;
    start?: string;
    end?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableResources =
    formData.resourceType === "room"
      ? rooms.map((r) => ({ id: r.id, name: r.name, type: "room" as const }))
      : assets.map((a) => ({ id: a.id, name: a.name, type: "asset" as const }));

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.resourceId) {
      newErrors.resourceId = "Выберите ресурс";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Введите название";
    }

    if (!formData.start) {
      newErrors.start = "Выберите дату и время начала";
    }

    if (!formData.end) {
      newErrors.end = "Выберите дату и время окончания";
    }

    if (formData.start && formData.end) {
      if (!isValidTimeRange(formData.start, formData.end)) {
        newErrors.general = "Время начала должно быть меньше времени окончания";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkOverlaps = (): boolean => {
    const newBooking = {
      ...formData,
      id: "temp-id",
    } as BookingDto;

    const otherBookings = isEdit
      ? existingBookings.filter((b) => b.id !== initialData.id)
      : existingBookings;

    return checkOverlap(otherBookings, newBooking);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (checkOverlaps()) {
      setErrors({
        ...errors,
        general: "Эта бронь пересекается с существующей для выбранного ресурса",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateBooking(initialData.id, formData);
      } else {
        await createBooking(formData);
      }
      onSuccess();
    } catch (error) {
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : "Ошибка при сохранении",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTimeLocal = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const toUTC = (localDateTime: string): string => {
    if (!localDateTime) return "";
    return new Date(localDateTime).toISOString();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }} noValidate>
      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert">
          {errors.general}
        </Alert>
      )}

      <Stack spacing={2.5}>
        {/* Тип ресурса */}
        <FormControl fullWidth>
          <InputLabel id="resource-type-label">Тип ресурса</InputLabel>
          <Select
            labelId="resource-type-label"
            id="resource-type"
            value={formData.resourceType}
            label="Тип ресурса"
            onChange={(e) => {
              setFormData({
                ...formData,
                resourceType: e.target.value as ResourceType,
                resourceId: "",
              });
            }}
          >
            <MenuItem value="room">Комната</MenuItem>
            <MenuItem value="asset">Актив</MenuItem>
          </Select>
        </FormControl>

        {/* Ресурс */}
        <FormControl fullWidth error={!!errors.resourceId}>
          <InputLabel id="resource-label">Ресурс</InputLabel>
          <Select
            labelId="resource-label"
            id="resource"
            value={formData.resourceId}
            label="Ресурс"
            onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
            inputProps={{ "aria-required": "true" }}
          >
            {availableResources.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
            {availableResources.length === 0 && (
              <MenuItem disabled>Нет доступных ресурсов</MenuItem>
            )}
          </Select>
          {errors.resourceId && (
            <FormHelperText>{errors.resourceId}</FormHelperText>
          )}
        </FormControl>

        {/* Название */}
        <TextField
          fullWidth
          label="Название брони"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={!!errors.title}
          helperText={errors.title}
          inputProps={{ "aria-required": "true" }}
        />

        {/* Дата и время начала */}
        <TextField
          fullWidth
          label="Начало"
          type="datetime-local"
          value={formatDateTimeLocal(formData.start)}
          onChange={(e) => {
            setFormData({
              ...formData,
              start: toUTC(e.target.value),
            });
          }}
          error={!!errors.start}
          helperText={errors.start}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          inputProps={{ "aria-required": "true" }}
        />

        {/* Дата и время окончания */}
        <TextField
          fullWidth
          label="Окончание"
          type="datetime-local"
          value={formatDateTimeLocal(formData.end)}
          onChange={(e) => {
            setFormData({
              ...formData,
              end: toUTC(e.target.value),
            });
          }}
          error={!!errors.end}
          helperText={errors.end}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          inputProps={{ "aria-required": "true" }}
        />

        {/* Примечание */}
        <TextField
          fullWidth
          label="Примечание"
          multiline
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Дополнительная информация..."
          inputProps={{ "aria-label": "Примечание к брони" }}
        />

        {/* Кнопки */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Отменить редактирование"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            aria-label={isEdit ? "Сохранить изменения" : "Создать бронь"}
          >
            {isSubmitting
              ? "Сохранение..."
              : isEdit
              ? "Обновить"
              : "Создать"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}