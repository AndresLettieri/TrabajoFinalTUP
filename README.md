# Documento de Especificación Funcional

## Sistema de Gestión para Distribuidora de Bebidas

**Trabajo Práctico Final – Tecnicatura en Programación**

**Integrantes:** Enzo Leiva – Andrés Lettieri

---

# 1. Introducción

## Problemática actual

Actualmente, la distribuidora gestiona gran parte de su información mediante planillas de Excel y registros en papel. Esta modalidad dificulta la centralización y actualización de la información, especialmente a medida que aumenta el volumen de artículos, clientes, compras y ventas.

La falta de un sistema centralizado genera dificultades para mantener un control preciso del stock y de las operaciones realizadas. Asimismo, el registro manual de las ventas dificulta conocer con exactitud cuánto se vendió, cuáles son los productos con mayor movimiento y qué rentabilidad generan las operaciones.

Como consecuencia, la obtención de información para el análisis del negocio requiere revisar y cruzar datos de diferentes fuentes, aumentando la posibilidad de errores y dificultando la toma de decisiones basada en información actualizada.

## Propuesta de solución

El presente proyecto propone el desarrollo de un sistema de gestión destinado al personal administrativo de una distribuidora de bebidas.

El sistema tiene como objetivo central facilitar y organizar la gestión de artículos, stock, clientes, proveedores, compras y ventas, incorporando además herramientas de consulta y reportes que permitan obtener información útil sobre la actividad comercial.

La propuesta está orientada a resolver las necesidades operativas principales de una distribuidora, priorizando la trazabilidad de las operaciones, el control del stock y la disponibilidad de información histórica para la toma de decisiones.

El proyecto será desarrollado como un Trabajo Práctico Final por un equipo de dos integrantes, quienes participarán tanto en las tareas de desarrollo backend como frontend.

# 2. Objetivos

## 2.1 Objetivo general

Desarrollar una aplicación web de gestión que permita administrar las operaciones principales de una distribuidora de bebidas, centralizando la información de artículos, clientes, proveedores, compras, ventas y stock.

## 2.2 Objetivos específicos

- Administrar el catálogo de artículos comercializados.
- Mantener actualizado el stock de manera automática.
- Registrar el ingreso de mercadería mediante operaciones de compra.
- Registrar las ventas realizadas por la distribuidora.
- Mantener un historial de las operaciones realizadas.
- Administrar la cartera de clientes.
- Administrar los proveedores.
- Permitir diferentes niveles de acceso según el rol del usuario.
- Generar información y reportes sobre las operaciones comerciales.
- Facilitar el control de productos con bajo nivel de stock.
- Mantener información histórica de precios y costos para permitir análisis posteriores.

# 3. Alcance del MVP

El MVP estará compuesto por los siguientes módulos:

- Autenticación y usuarios.
- Gestión de artículos.
- Gestión de categorías.
- Gestión de marcas.
- Gestión de clientes.
- Gestión de proveedores.
- Gestión de compras.
- Gestión de ventas.
- Gestión de stock.
- Comprobantes internos de venta.
- Reportes.
- Dashboard según rol de usuario.

# 4. Roles de usuario

El sistema contará inicialmente con dos roles.

## 4.1 Administrador

El usuario administrador tendrá acceso a todos los módulos del sistema.

Podrá:

- Administrar artículos.
- Administrar categorías.
- Administrar marcas.
- Administrar clientes.
- Administrar proveedores.
- Registrar compras.
- Anular compras.
- Registrar ventas.
- Anular ventas.
- Consultar reportes.
- Consultar información de stock.
- Administrar usuarios.
- Acceder al dashboard administrativo.

## 4.2 Vendedor

El vendedor tendrá acceso limitado a las funcionalidades relacionadas con la gestión comercial.

Podrá:

- Consultar artículos disponibles.
- Consultar su cartera de clientes.
- Registrar clientes.
- Registrar ventas.
- Consultar sus operaciones.
- Acceder al dashboard correspondiente a su rol.

El vendedor no tendrá acceso a:

- Gestión de compras.
- ABM de artículos.
- Gestión de proveedores.
- Gestión de categorías y marcas.
- Administración de usuarios.
- Reportes generales de administración.

La anulación de ventas quedará reservada al administrador.

# 5. Gestión de artículos

El sistema permitirá administrar los artículos comercializados por la distribuidora.

## 5.1 Datos principales

Cada artículo contará con:

- Código interno.
- Código de barras, opcional.
- Descripción.
- Categoría.
- Marca.
- Precio de compra.
- Precio de venta.
- Stock actual.
- Stock mínimo.
- Observaciones.
- Estado activo/inactivo.
- Datos de auditoría.

El código interno será ingresado manualmente por el usuario y deberá ser único.

El código de barras será opcional y, cuando exista, también deberá ser único.

No se contemplará la gestión de imágenes ni unidades de medida dentro del MVP.

## 5.2 Precios

El artículo almacenará:

- Precio de compra actual.
- Precio de venta actual.

El precio de venta podrá ser modificado por el usuario cuando sea necesario.

El sistema deberá advertir al usuario cuando el precio de venta sea inferior al precio de compra.

Esta situación no impedirá guardar el artículo.

## 5.3 Stock

El artículo almacenará el stock actual y el stock mínimo configurado.

El stock será actualizado automáticamente como consecuencia de las operaciones de compra, venta y anulación de dichas operaciones.

El stock no podrá modificarse manualmente dentro del MVP.

Cuando el stock se encuentre por debajo del mínimo establecido, el sistema deberá permitir identificar el artículo como producto con alerta de stock.

## 5.4 Estado del artículo

Los artículos podrán marcarse como activos o inactivos.

Los artículos inactivos:

- No aparecerán en las búsquedas operativas de compras y ventas.
- No podrán incorporarse a nuevas operaciones.
- No aparecerán en los listados principales del ABM.

El sistema podrá permitir consultar artículos inactivos desde la administración para posibilitar su reactivación.

La baja del artículo no estará condicionada por el stock existente.

# 6. Gestión de categorías y marcas

Categorías y marcas serán entidades administrables mediante ABM.

Contarán con:

- Identificador.
- Nombre.
- Estado activo/inactivo.
- Datos de auditoría.

Las bajas serán lógicas.

Los registros inactivos no estarán disponibles para nuevas asociaciones.

# 7. Gestión de clientes

El sistema permitirá administrar la cartera de clientes de la distribuidora.

## 7.1 Datos principales

Cada cliente contará con:

- Código.
- Nombre o razón social.
- Documento.
- Teléfono.
- Email, opcional.
- Dirección.
- Localidad.
- Observaciones, opcional.
- Estado activo/inactivo.
- Datos de auditoría.

El código y el documento deberán ser únicos.

## 7.2 Clientes inactivos

Los clientes podrán marcarse como inactivos.

Un cliente inactivo:

- No podrá seleccionarse para nuevas ventas.
- Permanecerá disponible para conservar el historial de operaciones anteriores.
- Podrá ser reactivado desde la administración.

## 7.3 Alta desde una venta

Desde el módulo de ventas se permitirá acceder rápidamente al alta de un nuevo cliente.

El objetivo es evitar que la falta de registro previo del cliente interrumpa el proceso de venta.

# 8. Gestión de proveedores

El sistema permitirá administrar los proveedores de los cuales la distribuidora adquiere mercadería.

## 8.1 Datos principales

Cada proveedor contará con:

- Código.
- Nombre o razón social.
- Teléfono.
- Email, opcional.
- Dirección.
- Localidad.
- Observaciones, opcional.
- Estado activo/inactivo.
- Datos de auditoría.

El código deberá ser único.

No se asociará un proveedor directamente a un artículo. Un mismo artículo puede ser adquirido independientemente de qué proveedor realice la venta.

## 8.2 Proveedores inactivos

Los proveedores podrán marcarse como inactivos.

Los proveedores inactivos no podrán utilizarse para registrar nuevas compras, pero permanecerán disponibles para conservar el historial de operaciones realizadas.

# 9. Ingreso de mercadería y compras

El sistema contará con un módulo para registrar las compras o ingresos de mercadería realizados por la distribuidora.

## 9.1 Registro de una compra

Una compra estará compuesta por:

- Proveedor.
- Fecha.
- Número de compra.
- Observaciones.
- Detalle de artículos.

Cada detalle incluirá:

- Artículo.
- Cantidad.
- Precio de compra unitario.
- Subtotal.

## 9.2 Precio de compra

El usuario ingresará el precio de compra del artículo al momento de registrar la operación.

Una vez confirmada la compra:

- El precio de compra informado quedará almacenado en el detalle.
- El precio de compra actual del artículo será actualizado con el nuevo valor.
- El stock del artículo será incrementado.

La actualización se realizará independientemente de si el nuevo precio es mayor o menor al precio de compra que tenía previamente el artículo.

El precio de venta no será modificado automáticamente.

## 9.3 Artículo inexistente

Si durante la carga de una compra se intenta ingresar un artículo que no existe, el sistema informará la situación y permitirá acceder al ABM de artículos para registrarlo.

Se buscará evitar la duplicación de lógica y formularios entre ambos módulos.

## 9.4 Anulación

Las compras confirmadas no podrán editarse.

Ante un error, deberán ser anuladas y, de ser necesario, cargadas nuevamente.

La anulación:

- Será lógica.
- Deberá quedar registrada.
- Revertirá los movimientos de stock generados por la compra.

El sistema deberá advertir al usuario que la anulación modifica el stock y puede generar diferencias si la mercadería ya fue utilizada en operaciones posteriores.

La operación deberá realizarse de manera transaccional.

# 10. Gestión de ventas

El sistema permitirá registrar las ventas realizadas por la distribuidora.

## 10.1 Registro de una venta

Una venta estará compuesta por:

- Cliente.
- Fecha.
- Número de comprobante.
- Medio de pago.
- Usuario que registra la operación.
- Detalle de artículos.
- Total.

Cada venta utilizará un único medio de pago.

No se contemplarán descuentos ni múltiples medios de pago dentro del MVP.

## 10.2 Carga de artículos

Los artículos podrán buscarse mediante:

- Código interno.
- Código de barras.
- Descripción.

La búsqueda podrá realizarse mediante un único campo de búsqueda.

El usuario no podrá ingresar una cantidad superior al stock disponible.

Además de la validación realizada en el frontend, el backend deberá validar nuevamente el stock al confirmar la operación.

Esta validación deberá realizarse de manera transaccional.

## 10.3 Precio de venta

El precio utilizado en la operación será el precio de venta vigente del artículo al momento de confirmar la venta.

El usuario no podrá modificar el precio desde el módulo de ventas dentro del MVP.

No se contemplarán descuentos.

## 10.4 Historial de precios

Cada detalle de venta almacenará:

- Precio de compra vigente al momento de la venta.
- Precio de venta aplicado al momento de la venta.
- Cantidad.
- Subtotal.

Esto permitirá conservar el contexto económico de la operación y calcular posteriormente la rentabilidad histórica.

## 10.5 Anulación

Las ventas confirmadas no podrán modificarse.

Si existe un error, la operación deberá anularse y registrarse nuevamente.

La anulación será lógica y deberá:

- Mantener el historial de la operación.
- Registrar el usuario responsable.
- Reingresar automáticamente al stock los artículos correspondientes.

La anulación deberá ejecutarse de manera transaccional.

La anulación de una venta estará disponible para el administrador.

# 11. Stock y trazabilidad

El sistema mantendrá el stock actual directamente asociado al artículo.

Las operaciones que modificarán el stock serán:

- Compra.
- Anulación de compra.
- Venta.
- Anulación de venta.

Cada modificación generará un registro histórico de movimiento de stock.

De esta manera, el sistema podrá conocer:

- Qué artículo fue afectado.
- Qué cantidad se modificó.
- Qué tipo de operación generó el movimiento.
- Cuándo ocurrió.
- Qué usuario realizó la operación.

El stock actual no será calculado recorriendo todo el historial de movimientos, sino que estará como dato en el registro del artículo.

# 12. Comprobante interno de venta

Al confirmar una venta, el sistema podrá generar un comprobante interno.

Este comprobante tendrá como finalidad:

- Control interno de la distribuidora.
- Control de pedidos.
- Entrega de información al cliente.
- Respaldo operativo de la venta.

El comprobante podrá incluir:

- Número de comprobante.
- Fecha.
- Cliente.
- Artículos.
- Cantidades.
- Precio de venta.
- Subtotales.
- Total.
- Medio de pago.

El comprobante no tendrá validez fiscal y no reemplazará una factura.

El número será almacenado como un valor numérico y se presentará con ocho dígitos mediante formato en la aplicación.

Por ejemplo:

```text
125 → 00000125
```

La numeración será independiente del identificador técnico de la base de datos.

# 13. Medios de pago

El sistema contemplará un único medio de pago por venta.

Los medios de pago serán almacenados como datos del sistema y no contarán con un ABM dentro del MVP.

Se podrán contemplar inicialmente medios como:

- Efectivo.
- Transferencia.
- Tarjeta de débito.
- Tarjeta de crédito.

La incorporación futura de nuevos medios de pago podrá realizarse mediante una actualización del sistema.

# 14. Reportes

El sistema contará con reportes orientados principalmente al usuario administrador.

## 14.1 Reporte de ventas

Permitirá consultar:

- Total vendido.
- Cantidad de comprobantes.
- Cantidad de artículos vendidos.

Contará con filtros por rango de fechas.

## 14.2 Reporte de compras

Permitirá consultar:

- Total comprado.
- Cantidad de operaciones de compra.

Contará con filtros por rango de fechas.

## 14.3 Reporte de ganancias

Permitirá analizar la ganancia generada en las ventas utilizando los precios históricos almacenados en cada detalle.

La información podrá filtrarse por rango de fechas.

## 14.4 Ventas por cliente

Permitirá consultar:

- Cliente.
- Cantidad de ventas.
- Importe vendido.

Podrá filtrarse por rango de fechas.

## 14.5 Ventas por vendedor

Permitirá consultar:

- Vendedor.
- Cantidad de ventas.
- Importe vendido.

Podrá filtrarse por rango de fechas.

## 14.6 Productos más vendidos

Permitirá identificar los artículos con mayor cantidad de unidades vendidas.

## 14.7 Categorías más vendidas

Permitirá identificar las categorías con mayor volumen de ventas y/o importe vendido.

## 14.8 Ganancias por categoría

Permitirá analizar la rentabilidad generada por las distintas categorías.

# 15. Dashboard

Se contemplarán dashboards diferenciados según el rol del usuario.

## 15.1 Dashboard Administrador

Podrá mostrar información general de la operación, como:

- Ventas del día.
- Compras del día.
- Ingresos del período.
- Ganancia estimada.
- Alertas de stock.

##15.2 Dashboard Vendedor

Estará orientado exclusivamente a su actividad comercial.

Podrá mostrar:

- Ventas del día.
- Ventas del mes.
- Cantidad de clientes de su cartera.
- Productos más vendidos.

El dashboard del vendedor no mostrará información administrativa relacionada con compras, stock general o indicadores globales de la distribuidora.

# 16. Auditoría

Las entidades y operaciones relevantes del sistema contarán con información básica de auditoría.

Se utilizarán únicamente los siguientes datos:

- createdAt: fecha y hora de creación.
- createdBy: usuario que realizó la creación.

Las operaciones históricas de compra y venta no podrán modificarse.

Cuando sea necesario corregir una operación, se deberá utilizar el mecanismo de anulación correspondiente y generar una nueva operación.

# 17. Principios de negocio

El diseño funcional del sistema se basará en los siguientes principios:

## 17.1 Operaciones históricas inmutables

Las compras y ventas confirmadas no podrán editarse.

## 17.2 Trazabilidad

Las operaciones deberán permitir identificar cuándo fueron realizadas y por qué usuario.

## 17.3 Stock actualizado

El stock actual se mantendrá directamente en el artículo y se modificará mediante operaciones controladas.

## 17.4 Precios históricos

Las operaciones conservarán los precios correspondientes al momento en que fueron realizadas.

## 17.5 Validación en backend

Las reglas críticas de negocio, especialmente las relacionadas con stock, deberán validarse en el backend independientemente de las validaciones realizadas en la interfaz.

## 17.6 Alcance controlado

Las funcionalidades serán incorporadas al MVP únicamente cuando aporten valor directo a los objetivos del proyecto.

Las funcionalidades adicionales podrán identificarse y documentarse como futuras evoluciones sin formar parte de la implementación inicial.

# 18. Funcionalidades Post-MVP

Durante el análisis se identificaron funcionalidades que aportarían valor a una evolución futura del sistema, pero que no serán necesarias para completar el MVP.

Entre ellas:

- Ajuste manual de stock.
- Asignación de vendedores a clientes.
- Historial específico de evolución de precios.
- Múltiples listas de precios.
- Descuentos y promociones.
- Múltiples medios de pago por venta.
- Cuenta corriente de clientes.
- Cuenta corriente de proveedores.
- Límite de crédito.
- Exportación avanzada de reportes.
- Funcionalidades comerciales adicionales.

Estas funcionalidades podrán ser incorporadas posteriormente en función de las necesidades del negocio y del tiempo disponible.

# 19. Funcionalidades fuera del alcance del MVP

También se identifican funcionalidades propias de sistemas de gestión comerciales de mayor alcance que no serán implementadas en este proyecto.

Entre ellas:

- Facturación electrónica.
- Integración con AFIP.
- Cálculo de impuestos.
- Emisión de comprobantes fiscales.
- Integración con plataformas de pago.
- Aplicación móvil.
- Gestión de múltiples depósitos.
- Gestión de lotes y vencimientos.
- Integración automática con proveedores.
- Automatización de compras.
- Pedidos online.
- Integración con sistemas externos.

La exclusión de estas funcionalidades responde a una decisión de alcance del Trabajo Práctico Final y no a la falta de reconocimiento de su importancia en una implementación comercial real.

El objetivo es priorizar un conjunto de funcionalidades que pueda ser implementado de manera completa, estable y consistente dentro del tiempo y recursos disponibles.

# 20. Consideraciones finales

El sistema propuesto busca resolver las necesidades operativas esenciales de una distribuidora mediante una aplicación web centralizada.

El alcance definido prioriza:

- Gestión de artículos.
- Control de stock.
- Compras.
- Ventas.
- Clientes.
- Proveedores.
- Usuarios y permisos.
- Información histórica.
- Reportes.

El diseño contempla además la posibilidad de evolucionar el sistema en el futuro, manteniendo separadas las funcionalidades esenciales del MVP de aquellas que podrían incorporarse en nuevas versiones.

De esta manera, el proyecto busca demostrar no solo la capacidad de implementar una aplicación funcional, sino también la capacidad de analizar un problema, establecer prioridades, definir reglas de negocio y tomar decisiones de diseño de manera fundamentada.

# 21. Stack tecnologico

- Para el desarrollo del proyecto se utilizará una arquitectura web basada en una API REST. El frontend será desarrollado utilizando TypeScript, con Vite como herramienta de desarrollo y CSS para los estilos y la construcción de la interfaz. 
- El backend será desarrollado en C#, utilizando ASP.NET Core Web API para la implementación de los servicios REST y Entity Framework Core como ORM para el acceso a datos mediante DbContext. 
- Como motor de base de datos se utilizará MySQL, debido a la naturaleza relacional de la información y a la necesidad de mantener integridad y transaccionalidad en operaciones como compras, ventas y actualización de stock. 
- El código fuente será gestionado mediante Git y alojado en un repositorio único de GitHub.
