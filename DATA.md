# DATA.md — Модель данных и формат JSON

## Модели

### Room

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `string` | Уникальный ID |
| `name` | `string` | Название |
| `capacity` | `number` | Вместимость |
| `features` | `string[]` | Оборудование |

### Asset

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `string` | Уникальный ID |
| `name` | `string` | Название |
| `inventoryCode` | `string` | Инвентарный номер |
| `status` | `available \| in_use \| maintenance` | Статус |

### Booking

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `string` | Уникальный ID |
| `resourceType` | `room \| asset` | Тип |
| `resourceId` | `string` | ID ресурса |
| `title` | `string` | Название |
| `start` | `string` | Начало (ISO 8601) |
| `end` | `string` | Конец (ISO 8601) |
| `notes` | `string?` | Примечание |

## Формат JSON

```json
{
  "rooms": [...],
  "assets": [...],
  "bookings": [...],
  "exportedAt": "2025-09-05T12:00:00.000Z",
  "version": "1.0"
}

---Нет пересечений.
---UTC → локальное
---start < end.

---IndexedDB (RoomAssetsDB)
---Хранилища: rooms, assets, bookings