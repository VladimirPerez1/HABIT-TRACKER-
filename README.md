# HABIT TRACKER API

Repositorio oficial:  
https://github.com/VladimirPerez1/HABIT-TRACKER-


La aplicación utiliza SQL Server como motor de base de datos y JWT para autenticación.

---

## 🛠️ Tecnologías Utilizadas

- Node.js  
- Express.js  
- SQL Server  
- mssql  
- bcryptjs  
- jsonwebtoken  
- dotenv  
- express-validator  
- helmet  
- cors  
- morgan  
- nodemailer  

---

## Requisitos Previos

Antes de ejecutar el proyecto, debes tener instalado:

- Node.js
- SQL Server Management Studio
---

## Instalación del Proyecto

### 1️Clonar el repositorio

```bash
git clone https://github.com/VladimirPerez1/HABIT-TRACKER-.git
cd HABIT-TRACKER-
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

Instalar manualmente:

```bash
npm install express mssql bcryptjs jsonwebtoken dotenv express-validator helmet cors morgan nodemailer
```

---

## Configuración de Base de Datos

1. Abrir SQL Server Management Studio  
2. Ejecutar el archivo:

```
database/database.sql
```

Este script:

- Crea la base de datos `HabitTrackerDB`  
- Crea todas las tablas  
- Crea relaciones e índices  

---

## Configuración de Variables de Entorno

1. Copiar el archivo:

```
.env.example
```

2. Renombrarlo a:

```
.env
```

3. Configurar los valores necesarios:

- DB_SERVER  
- DB_DATABASE  
- DB_USER  
- DB_PASSWORD  
- JWT_SECRET  
- EMAIL_USER  
- EMAIL_PASSWORD  


---

## Ejecutar la Aplicación

Modo normal:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

La API quedará ejecutándose en:

```
http://localhost:3000
```

---
  

---

## Estructura del Proyecto (ANTES DE TERMINAR, ESTE SE SUBIÓ EN EL ENTREGABLE DE AVANCES)

```
HABIT_TRACKER/

├── config/
│   └── database.js
│
├── controllers/
│   ├── authController.js
│   └── habitController.js
│
├── database/
│   └── database.sql
│
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
│
├── models/
│   ├── Habit.js
│   └── user.js
│
├── public/
│   ├── css/
│   │   ├── dashboard.css
│   │   ├── forgot-password.css
│   │   ├── login.css
│   │   ├── profile.css
│   │   ├── register.css
│   │   └── reset-password.css
│   │
│   ├── images/
│   │
│   └── js/
│       ├── dashboard.js
│       ├── forgot-password.js
│       ├── login.js
│       ├── profile.js
│       ├── register.js
│       └── reset-password.js
│
├── routes/
│   ├── auth.js
│   └── habits.js
│
├── services/
│   └── emailService.js
│
├── utils/
│   └── jwtHelper.js
│
├── views/
│   ├── dashboard.html
│   ├── forgot-password.html
│   ├── login.html
│   ├── profile.html
│   ├── register.html
│   └── reset-password.html
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```


---
## Estructura del Proyecto (COMPLETADO)
```
HABIT_TRACKER/
├── config/
│   └── database.js
│
├── controllers/
│   ├── authController.js
│   ├── habitController.js
│   ├── categoryController.js
│   ├── trackingController.js
│   ├── routineController.js
│   └── statsController.js
│
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
│
├── models/
│   ├── User.js
│   ├── Habit.js
│   ├── Category.js
│   ├── Tracking.js
│   └── Routine.js
│
├── public/
│   ├── css/
│   │   ├── index.css
│   │   ├── login.css
│   │   ├── register.css
│   │   ├── dashboard.css
│   │   ├── habits.css
│   │   ├── routines.css
│   │   ├── statistics.css
│   │   ├── profile.css
│   │   ├── forgot-password.css
│   │   └── reset-password.css
│   │
│   ├── js/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── habits.js
│   │   ├── routines.js
│   │   ├── statistics.js
│   │   ├── profile.js
│   │   ├── forgot-password.js
│   │   └── reset-password.js
│   │
│   └── images/
│
├── routes/
│   ├── auth.js
│   ├── habits.js
│   ├── categories.js
│   ├── tracking.js
│   ├── routines.js
│   └── stats.js
│
├── services/
│   ├── emailService.js
│   ├── streakService.js
│   ├── statsService.js
│   ├── authService.js
│   └── habitService.js
│
├── tests/
│   ├── auth.test.js
│   ├── habits.test.js
│   └── integration.test.js
│
├── utils/
│   ├── jwtHelper.js
│   ├── dateHelper.js
│   └── validators.js
│
├── views/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── habits.html
│   ├── routines.html
│   ├── statistics.html
│   ├── profile.html
│   ├── forgot-password.html
│   └── reset-password.html
│
├── INCIDENCIAS.md
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

---


##  Autor

Vladimir Pérez Soto - Danny Enmanuel Guerrero 
