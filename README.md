# Sistema de Gestión para Distribuidora de Bebidas

Sistema web de gestión desarrollado como **Trabajo Práctico Final de la Tecnicatura en Programación**.

El proyecto tiene como objetivo centralizar y digitalizar las principales operaciones de una distribuidora de bebidas, reemplazando el manejo disperso de información mediante planillas de Excel y registros en papel.

---

## 📋 Descripción

La distribuidora actualmente gestiona información relacionada con artículos, clientes, compras y ventas mediante diferentes medios de registro. 
Esta modalidad dificulta el control del stock, el seguimiento de las operaciones y la obtención de información confiable sobre ventas y rentabilidad.

El sistema propuesto centraliza esta información y automatiza los principales procesos de gestión.

Entre sus funcionalidades se encuentran:

* Gestión de artículos, categorías y marcas.
* Control de stock.
* Gestión de clientes y proveedores.
* Registro de compras e ingreso de mercadería.
* Registro y anulación de ventas.
* Generación de comprobantes internos de venta.
* Gestión de usuarios y roles.
* Reportes de ventas, compras y ganancias.
* Identificación de productos y categorías con mayor movimiento.
* Dashboards diferenciados según el rol del usuario.

El sistema está orientado principalmente al **uso administrativo y comercial interno de la distribuidora**.

---

## 🎯 Objetivos

* Centralizar la información de la distribuidora.
* Mejorar el control y trazabilidad del stock.
* Registrar de forma estructurada las compras y ventas.
* Mantener información histórica de precios y costos.
* Facilitar el análisis de ventas y rentabilidad.
* Reducir errores derivados del manejo manual de información.
* Proporcionar información útil para la toma de decisiones.

---

## 👥 Roles

El sistema contempla inicialmente dos roles:

### Administrador

Acceso completo a los módulos del sistema:

* Artículos
* Categorías
* Marcas
* Clientes
* Proveedores
* Compras
* Ventas
* Reportes
* Usuarios
* Dashboard administrativo

### Vendedor

Acceso a las funcionalidades relacionadas con su actividad comercial:

* Consulta de artículos
* Gestión de su cartera de clientes
* Alta de clientes
* Registro de ventas
* Dashboard de vendedor

---

## 🛠️ Tecnologías

### Frontend

* [Vite](https://vitejs.dev/)
* TypeScript

### Backend

* C#
* ASP.NET Core Web API
* Entity Framework Core

### Base de datos

* MySQL

### Herramientas

* Git
* GitHub

---

## 🏗️ Arquitectura

El sistema utiliza una arquitectura basada en una API REST.

```text
┌─────────────────────────────┐
│     Vite + TypeScript       │
│                             │
└──────────────┬──────────────┘
               │
               │ HTTP / REST
               ▼
┌─────────────────────────────┐
│      ASP.NET Core API       │
│                             │
│        Controllers          │
│             ↓               │
│          Services           │
│             ↓               │
│          DbContext          │
└──────────────┬──────────────┘
               │
               │ Entity Framework Core
               ▼
┌─────────────────────────────┐
│            MySQL            │
└─────────────────────────────┘
```

Para el acceso a datos se utilizará directamente **Entity Framework Core mediante `DbContext`**, evitando implementar una capa Repository adicional que no aporta valor significativo para el alcance del proyecto.

---

## 📦 Principales módulos

| Módulo      | Descripción                                      |
| ----------- | ------------------------------------------------ |
| Artículos   | Gestión de artículos, precios y stock            |
| Categorías  | Clasificación de artículos                       |
| Marcas      | Gestión de marcas                                |
| Clientes    | Gestión de cartera de clientes                   |
| Proveedores | Gestión de proveedores                           |
| Compras     | Registro de ingreso de mercadería                |
| Ventas      | Registro y gestión de ventas                     |
| Stock       | Control y trazabilidad de movimientos            |
| Usuarios    | Gestión de usuarios y roles                      |
| Reportes    | Información sobre ventas, compras y rentabilidad |
| Dashboard   | Indicadores según el rol del usuario             |

---

## 📚 Documentación

La documentación del proyecto incluye el análisis funcional, las decisiones de diseño y la documentación de alcance desarrollada durante el Trabajo Práctico Final.

---

## 👨‍💻 Equipo

**Trabajo Práctico Final — Tecnicatura en Programación**

Proyecto desarrollado por un equipo de 2 integrantes.

Enzo Leiva

Andrés Lettieri
