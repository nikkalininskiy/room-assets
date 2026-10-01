# COMPAT.md — Совместимость

## Windows

- **ОС:** Windows 10/11
- **Node.js:** 22.x
- **Браузеры:** Chrome, Edge, Firefox

### Проблемы и решения

| Проблема | Решение |
|----------|---------|
| Долгая установка | Зеркало npm |
| EPERM | Терминал от админа |
| SSL при push | VLESS + Reality |

## Linux (WSL 2)

- **ОС:** Ubuntu 22.04 (WSL 2)
- **Node.js:** 22.x

### Запуск

```bash
cd /mnt/c/Users/Admin/room-assets
npm install
npm run dev -- --host