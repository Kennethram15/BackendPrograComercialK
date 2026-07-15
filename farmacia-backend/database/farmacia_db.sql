-- =====================================================================
-- Sistema de Farmacia - Script de creación de base de datos
-- Motor: MySQL 8+
-- Refleja exactamente los modelos de Sequelize (models/*.js)
-- Orden de creación: primero las tablas "padre", luego las que llevan FK
-- =====================================================================

CREATE DATABASE IF NOT EXISTS farmacia_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE farmacia_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Tablas sin dependencias (raíces de cada rama del diagrama)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS casa_medica;
CREATE TABLE casa_medica (
  id_casa_medica     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_casa_medica VARCHAR(150) NOT NULL,
  estado_casa_medica  TINYINT(1) NOT NULL DEFAULT 1,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS presentacion;
CREATE TABLE presentacion (
  id_presentacion     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_presentacion VARCHAR(100) NOT NULL,
  estado_presentacion TINYINT(1) NOT NULL DEFAULT 1,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS cliente;
CREATE TABLE cliente (
  id_cliente     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cliente VARCHAR(150) NOT NULL,
  nit_cliente    VARCHAR(20) NOT NULL DEFAULT 'C/F',
  estado_cliente TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id_rol     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL,
  estado_rol TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS metodos_pago;
CREATE TABLE metodos_pago (
  id_metodo_pago     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_metodo_pago VARCHAR(50) NOT NULL,
  cuenta_metodo_pago VARCHAR(50),
  estado_metodo_pago TINYINT(1) NOT NULL DEFAULT 1,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Segundo nivel: dependen de una sola tabla raíz
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS proveedor;
CREATE TABLE proveedor (
  id_proveedor                 INT AUTO_INCREMENT PRIMARY KEY,
  id_casa_medica                INT NOT NULL,
  nombre_proveedor              VARCHAR(150) NOT NULL,
  estado_proveedor              TINYINT(1) NOT NULL DEFAULT 1,
  telefono_proveedor            VARCHAR(20),
  direccion_proveedor           VARCHAR(255),
  correo_proveedor              VARCHAR(150),
  total_adquirido_proveedor     DECIMAL(12,2) NOT NULL DEFAULT 0,
  cantidad_adquirido_proveedor  INT NOT NULL DEFAULT 0,
  created_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_proveedor_casa_medica
    FOREIGN KEY (id_casa_medica) REFERENCES casa_medica(id_casa_medica)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS medicamento;
CREATE TABLE medicamento (
  id_medicamento                INT AUTO_INCREMENT PRIMARY KEY,
  id_presentacion                INT NOT NULL,
  codigo_barras                  VARCHAR(50) UNIQUE,
  nombre_medicamento             VARCHAR(150) NOT NULL,
  cantidad_por_paquete            INT NOT NULL DEFAULT 1,
  precio_mayorista                DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_minimo                   DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_venta                    DECIMAL(12,2) NOT NULL DEFAULT 0,
  componente_activo                VARCHAR(150),
  estado_medicamento              TINYINT(1) NOT NULL DEFAULT 1,
  venta_libre                      TINYINT(1) NOT NULL DEFAULT 1,
  existencia_total_medicamento    INT NOT NULL DEFAULT 0,
  created_at                       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_medicamento_presentacion
    FOREIGN KEY (id_presentacion) REFERENCES presentacion(id_presentacion)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id_usuarios      INT AUTO_INCREMENT PRIMARY KEY,
  id_rol           INT NOT NULL,
  usuario          VARCHAR(50) NOT NULL UNIQUE,
  password         VARCHAR(255) NOT NULL,
  nombre_usuario   VARCHAR(150) NOT NULL,
  telefono_usuario VARCHAR(20),
  correo_usuario   VARCHAR(150),
  dpi_usuario      VARCHAR(20),
  estado_usuario   TINYINT(1) NOT NULL DEFAULT 1,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tercer nivel
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS compras;
CREATE TABLE compras (
  id_compra     INT AUTO_INCREMENT PRIMARY KEY,
  id_proveedor  INT NOT NULL,
  fecha_compra  DATE NOT NULL,
  estado_compra VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  total_compra  DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_compras_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS lote;
CREATE TABLE lote (
  id_lote           INT AUTO_INCREMENT PRIMARY KEY,
  id_medicamento    INT NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_produccion  DATE,
  precio_lote       DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado_lote       TINYINT(1) NOT NULL DEFAULT 1,
  existencia_lote   INT NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lote_medicamento
    FOREIGN KEY (id_medicamento) REFERENCES medicamento(id_medicamento)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS venta;
CREATE TABLE venta (
  id_venta     INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente   INT NOT NULL,
  id_usuario   INT NOT NULL,
  fecha_venta  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_venta VARCHAR(30) NOT NULL DEFAULT 'completada',
  total_venta  DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_venta_cliente
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_venta_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuarios)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Cuarto nivel: tablas "detalle", dependen de dos tablas
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS detalle_compra;
CREATE TABLE detalle_compra (
  id_detalle_compra      INT AUTO_INCREMENT PRIMARY KEY,
  id_compra              INT NOT NULL,
  id_proveedor           INT NOT NULL,
  id_medicamento         INT NOT NULL,
  cantidad_detalle_compra INT NOT NULL,
  subtotal_detalle_compra DECIMAL(12,2) NOT NULL,
  estado_detalle_compra   VARCHAR(30) NOT NULL DEFAULT 'activo',
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_detalle_compra_compra
    FOREIGN KEY (id_compra) REFERENCES compras(id_compra)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_detalle_compra_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_detalle_compra_medicamento
    FOREIGN KEY (id_medicamento) REFERENCES medicamento(id_medicamento)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS detalle_venta;
CREATE TABLE detalle_venta (
  id_detalle_venta      INT AUTO_INCREMENT PRIMARY KEY,
  id_medicamento        INT NOT NULL,
  id_venta              INT NOT NULL,
  cantidad_detalle_venta INT NOT NULL,
  subtotal_detalle_venta DECIMAL(12,2) NOT NULL,
  estado_detalle_venta   VARCHAR(30) NOT NULL DEFAULT 'activo',
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_detalle_venta_medicamento
    FOREIGN KEY (id_medicamento) REFERENCES medicamento(id_medicamento)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_detalle_venta_venta
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS detalle_metodos_pago;
CREATE TABLE detalle_metodos_pago (
  id_detalle_metodos_pago      INT AUTO_INCREMENT PRIMARY KEY,
  id_venta                     INT NOT NULL,
  id_metodo_pago                INT NOT NULL,
  cantidad_detalle_metodos_pago DECIMAL(12,2) NOT NULL,
  estado_detalle_metodos_pago   VARCHAR(30) NOT NULL DEFAULT 'activo',
  created_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_detalle_metodos_pago_venta
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detalle_metodos_pago_metodo
    FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id_metodo_pago)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Datos semilla mínimos (catálogos que la app necesita para funcionar)
-- =====================================================================

INSERT INTO roles (nombre_rol) VALUES
  ('Administrador'),
  ('Vendedor'),
  ('Bodeguero');

INSERT INTO metodos_pago (nombre_metodo_pago, cuenta_metodo_pago) VALUES
  ('Efectivo', NULL),
  ('Tarjeta', NULL),
  ('Transferencia', NULL);

INSERT INTO presentacion (nombre_presentacion) VALUES
  ('Tableta'),
  ('Jarabe'),
  ('Cápsula'),
  ('Inyectable'),
  ('Crema');

INSERT INTO cliente (nombre_cliente, nit_cliente) VALUES
  ('Consumidor Final', 'C/F');
