# Arquitectura del sistema

## 1. Descripción general

El sistema utiliza una arquitectura cliente-servidor, donde el frontend se encarga de la interfaz de usuario y el backend concentra la lógica de negocio y el acceso a los datos.

Ambas partes se comunican mediante una API REST utilizando HTTP y el intercambio de información en formato JSON.

La arquitectura busca separar las responsabilidades de cada componente para facilitar el mantenimiento y evolución del sistema.

## 2. Arquitectura general

La comunicación entre los principales componentes del sistema se estructura de la siguiente manera:

```text
Frontend
   │
   │ HTTP / JSON
   ▼
Backend - API REST
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
Entity Framework Core
   │
   ▼
MySQL
```

El frontend consume los endpoints expuestos por el backend. El backend procesa las solicitudes, aplica las reglas de negocio y utiliza la base de datos para almacenar y consultar la información.

## 3. Backend

El backend está desarrollado en **C# con .NET** y utiliza **Entity Framework Core** para el acceso a la base de datos.

La API se organiza en diferentes capas para separar las responsabilidades como Controllers, Services, Repositories, Models y DTOs

## 4. Frontend

El frontend será desarrollado utilizando **TypeScript** y **Vite**, proporcionando la interfaz mediante la cual los usuarios interactuarán con el sistema.

La estructura y comportamiento de la aplicación estarán implementados en TypeScript, mientras que el diseño visual y la adaptación de la interfaz se realizarán mediante **CSS**.

El frontend se comunicará con el backend a través de la API REST mediante solicitudes HTTP e intercambio de información en formato JSON.

## 5. Base de datos

El sistema utiliza **MySQL** como sistema gestor de base de datos.

La persistencia se realiza mediante **Entity Framework Core**, que funciona como ORM entre el código del backend y las tablas de la base de datos.

El modelo de datos es relacional y contiene las entidades necesarias para administrar usuarios, productos, clientes, proveedores, compras, ventas y stock.

El diseño detallado de la base de datos se encuentra documentado en `MER DistribuidoraBebidas.png`.

## 6. APIs y servicios externos

En el alcance actual del MVP no se contemplan integraciones con APIs o servicios externos.

En particular, el sistema no incluye integración con ARCA, plataformas de pago, entidades financieras ni otros servicios externos.

## 7. Estructura del repositorio

El repositorio se organiza separando el frontend, backend, base de datos y documentación:

```text
/
├── frontend/
├── backend/
├── database/
└── documentoss/
```

### `/frontend`

Contiene el código correspondiente a la interfaz de usuario.

### `/backend`

Contiene la API REST, la lógica de negocio, el acceso a datos y los modelos utilizados por el sistema.

### `/database`

Contiene los scripts necesarios para crear y configurar la base de datos.

### `/docs`

Contiene los documentos y diagramas relacionados con el análisis, diseño y arquitectura del proyecto.
