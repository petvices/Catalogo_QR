<div align="center">

![v1.0.0](https://img.shields.io/badge/Version-0.0.7-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Typescript](https://img.shields.io/badge/TypeScript-4.9+-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![discontinued](https://img.shields.io/badge/status-discontinued-red)

🚀 Tu catálogo inteligente, accesible con un solo escaneo
Solución digital para restaurantes, emprendimientos y negocios que buscan automatizar sus ventas

[🔗 Ver Demo](https://qr-eta-gray.vercel.app/) | [📖 Documentación](https://github.com/petvices/Catalogo_QR) | [🐛 Reportar Error]()

</div>

## 🎯 Descripción del Proyecto
**Catálogo Digital QR** es una plataforma _web/móvil_ desarrollada en 2024 que revoluciona la forma en que los negocios pequeños y restaurantes gestionan sus ventas. Mediante un simple código QR, los clientes acceden a un catálogo digital completo donde pueden visualizar productos, realizar compras y gestionar sus pedidos sin necesidad de intervención humana constante.

_"Lo que comenzó como una solución para eliminar la dependencia de WhatsApp como canal de ventas, se convirtió en una plataforma completa con sistema de afiliados, gestión de facturación y panel administrativo intuitivo"._

## ✨ Características Principales
- **Acceso Inmediato:** Los clientes acceden al catálogo escaneando un código QR o mediante enlace directo.
- **Compra Integrada:** Proceso de compra completo sin salir de la plataforma.
- **Panel Administrativo:** Gestión total de productos, ventas y configuración del negocio.
- **Sistema de Afiliados:** Programa de fidelización con tarjeta de compras y recompensas.
- **Facturación Automática:** Generación y visualización de facturas para cada compra.
- **Actualización en Tiempo Real:** Los cambios en productos se reflejan sin regenerar códigos QR.
- **Diseño Responsive:** Funciona perfectamente en móviles, tablets y desktop.

## 🎯 ¿Por qué Catálogo Digital QR?
El problema que resuelve
Los negocios pequeños y restaurantes tradicionalmente dependen de:

- Atención manual por WhatsApp para recibir pedidos.
- Menús físicos que requieren reimpresión constante.
- Gestión desorganizada de ventas y clientes.
- Procesos manuales de fidelización.

_Catálogo Digital automatiza todo el proceso:_

- ✅ Clientes compran directamente sin esperar respuestas.
- ✅ Catálogo siempre actualizado sin costos de impresión.
- ✅ Dashboard centralizado para gestionar ventas.
- ✅ Sistema de recompensas automático que incentiva la recurrencia.

## 🛠️ Stack Tecnológico
| Frontend | Descripción |
|-----------|--------------|
| Next.js 14| Framework React con renderizado híbrido. |
| TypeScript | Tipado estático para mayor robustez |
| Tailwind CSS | Estilizado rápido y responsive |
| React Hooks | Gestión de estado y lógica de componentes |

| Backend | Descripción | Estado |
|-----------|--------------|--------|
| Supabase | Base de datos PostgreSQL en tiempo real |✅|
| Autenticación | Sistema de usuarios integrado con Supabase Auth |✅|
| Storage | Almacenamiento de imágenes de productos |✅|

_Herramientas de Desarrollo:_ 
- Git - Control de versiones
- ESLint - Linting de código
- Prettier - Formateo consistente
---
## 📲 Funcionalidades
_Para clientes:_
|Funcionalidad | Descripción |
|-----------|--------------|
🏠Home del Catálogo | Vista principal con todos los productos disponibles
🔍Búsqueda y Filtros |	Encuentra productos rápidamente por categorías
🛒Carrito de Compras | Gestión intuitiva de items a comprar
💳Checkout | Proceso de pago simplificado
📄Historial de Compras | Visualización de pedidos anteriores
🎫Tarjeta de Afiliado | Sistema de puntos y recompensas

_Para Administradores:_
|Funcionalidad | Descripción |
|-----------|--------------|
📊Dashboard | Vista general de ventas y estadísticas
📦Gestión de Productos | CRUD completo del catálogo
👥Gestión de Clientes | Visualización de usuarios y sus compras
🎁Sistema de Recompensas | Configuración de beneficios por compras
📈Reportes de Ventas | Análisis detallado del negocio
⚙️Configuración | Personalización de la tienda

## Instalación y Configuración Local
**Prerrequisitos**:
- Node.js 18+.
- npm o yarn.
- Cuenta en Supabase.

Clonar el repositorio:
```
bash

git clone https://github.com/petvices/Catalogo_QR.git
cd catalogo-qr
```
Instalar dependencias:
```
bash

npm install
# o
yarn install``
```
Configurar variables de entorno:


```
Crea un archivo .env.local en la raíz del proyecto 

NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_llave_anonima_de_supabase
```
Configurar Supabase
```
Crea un proyecto en Supabase.
Ejecuta las migraciones necesarias.
Configura las tablas: productos, usuarios, ventas, afiliados, etc.
```
Ejecutar en desarrollo:
```
bash

npm run dev
# o
yarn dev
```
Construir para producción:
```
bash

npm run build
npm start
```
## 📸 Capturas de Pantalla
Nota: Las capturas de pantalla estarán disponibles próximamente

Vista Cliente	Vista Admin
[Placeholder Home]	[Placeholder Dashboard]
[Placeholder Productos]	[Placeholder Gestión]

## 🤝 Cómo Contribuir
Aunque el proyecto está actualmente discontinuado, apreciamos el interés en contribuir:

¡Las contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md) para empezar.

## 📄 Licencia
Este proyecto está bajo licencia privada. Todos los derechos estan reservados.

---

<div align="center"> <sub>Hecho con ❤️ para emprendedores y pequeños negocios | 2024</sub> </div>

#### Nota ::
Este proyecto se encuentra actualmente discontinuado debido a diversas circunstancias técnicas y operativas. La base de datos original no está activa, pero el código fuente permanece disponible como referencia y para fines educativos.
