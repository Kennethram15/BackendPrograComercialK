# Sistema de Farmacia — Backend (MVC)

API REST construida con Node.js 22+, Express y Sequelize (MySQL), siguiendo arquitectura MVC.

## Estructura

```
farmacia-backend/
├── config/
│   └── database.js          # Conexión Sequelize a MySQL
├── models/                  # 14 modelos (uno por entidad del diagrama)
│   ├── index.js              # Carga modelos y define asociaciones 1:M
│   ├── CasaMedica.js
│   ├── Proveedor.js
│   ├── Compras.js
│   ├── DetalleCompra.js
│   ├── Presentacion.js
│   ├── Medicamento.js
│   ├── Lote.js
│   ├── Cliente.js
│   ├── Roles.js
│   ├── Usuarios.js
│   ├── Venta.js
│   ├── DetalleVenta.js
│   ├── MetodosPago.js
│   └── DetalleMetodosPago.js
├── controllers/             # Un controlador CRUD por entidad
│   ├── baseController.js     # Fábrica CRUD genérica reutilizada por todos
│   └── ...Controller.js
├── routes/                  # Un archivo de rutas por entidad + index.js
├── middlewares/
│   └── errorHandler.js
├── app.js                   # Configuración de Express
├── server.js                # Punto de entrada, conecta DB y sincroniza modelos
├── .env.example
└── package.json
```

## Instalación

Tienes dos formas de crear las tablas — elige una:

**Opción A: script SQL manual** (`database/farmacia_db.sql`)

```bash
mysql -u root -p < database/farmacia_db.sql
```

Crea la base `farmacia_db`, las 14 tablas con sus llaves foráneas, y siembra
catálogos mínimos (roles, métodos de pago, presentaciones, cliente C/F) para
que la app tenga datos con qué arrancar.

**Opción B: dejar que Sequelize sincronice** — solo crea `farmacia_db` vacía
en MySQL y deja que `server.js` genere las tablas:

```bash
cd farmacia-backend
npm install
cp .env.example .env
# Edita .env con tus credenciales de MySQL
npm run dev
```

Con `DB_FORCE_SYNC=false` (recomendado), Sequelize usa `alter: true` y ajusta las
tablas existentes sin borrarlas. Cambia a `true` solo si quieres recrear la base
desde cero en desarrollo. Si ya corriste el script SQL de la opción A, deja
`DB_FORCE_SYNC=false`: Sequelize solo ajustará lo que falte, no borrará tus datos.

## Relaciones (todas 1:M, sin M:N implícitas)

| Padre (1)     | Hijo (M)              | FK en el hijo      |
|---------------|------------------------|--------------------|
| CasaMedica    | Proveedor              | id_casa_medica     |
| Proveedor     | Compras                | id_proveedor       |
| Proveedor     | DetalleCompra          | id_proveedor       |
| Compras       | DetalleCompra          | id_compra          |
| Medicamento   | DetalleCompra          | id_medicamento     |
| Presentacion  | Medicamento            | id_presentacion    |
| Medicamento   | Lote                   | id_medicamento     |
| Medicamento   | DetalleVenta           | id_medicamento     |
| Venta         | DetalleVenta           | id_venta           |
| Cliente       | Venta                  | id_cliente         |
| Roles         | Usuarios               | id_rol             |
| Usuarios      | Venta                  | id_usuario         |
| Venta         | DetalleMetodosPago     | id_venta           |
| MetodosPago   | DetalleMetodosPago     | id_metodo_pago     |

> Nota: `id_cliente` y `id_usuario` en `Venta`, así como `id_venta` en
> `DetalleMetodosPago` e `id_metodo_pago` en `DetalleMetodosPago`, no aparecían
> como columnas explícitas en el diagrama, pero se añadieron porque las flechas
> del diagrama exigen esa llave foránea para que la relación 1:M exista en un
> modelo relacional.

## Endpoints

Todas las entidades exponen el mismo patrón CRUD bajo `/api`:

```
GET    /api/<recurso>
GET    /api/<recurso>/:id
POST   /api/<recurso>
PUT    /api/<recurso>/:id
DELETE /api/<recurso>/:id
```

Recursos disponibles: `casas-medicas`, `proveedores`, `compras`,
`detalle-compras`, `presentaciones`, `medicamentos`, `lotes`, `clientes`,
`roles`, `usuarios`, `ventas`, `detalle-ventas`, `metodos-pago`,
`detalle-metodos-pago`.

Ejemplo: `GET http://localhost:3000/api/medicamentos` devuelve los
medicamentos junto con su presentación y sus lotes (según el `include`
definido en cada controlador).
