# Bitespeed Task Repository 

<code>bitespeed-task-repo</code> is a **MVC based REST API monolithic** backend system. 

## Getting Started

### Install

1. Clone repository [here](https://github.com/Gaurav-Wagh1/bitespeed-task-repo.git)
```
git clone https://github.com/Gaurav-Wagh1/bitespeed-task-repo.git
```
2. Move to the project's root directory
```
cd bitespeed-task-repo
```

3. Install dependencies
``` 
npm install
```

4. Create a .env file in root directory and add your environment variables. See .env.sample for assistance

5. Create a config.json file inside `bitespeed-task-repo\src\config` directory with following content
```
{
    "development": {
      "username": "root",
      "password": "your-db-password",
      "database": "bitespeed-task-db",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "test": {
      "username": "root",
      "password": null,
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "production": {
      "username": "root",
      "password": null,
      "database": "database_production",
      "host": "127.0.0.1",
      "dialect": "mysql"
    }
  }
  
```

6. Move to the src directory
```
cd src
```

7. Run the given commands
```
npx sequelize db:create
npx sequelize db:migrate
```

8. Get back to the root directory
```
cd ..
```

### Usage
Run local server from root directory
```bash
npm start
```

### API Endpoints

| HTTP Verbs | Endpoints | Action | Expected Data |
|  :---:  |  :---:  |  :---:  |  :---:  |
| POST | /identity | To add credentials in system or to collect the shopper details for personalization | email : string,<br> phoneNumber : string <br> in **JSON body**

### Technologies Used

* [Node.js](https://nodejs.org/en)

* [Expressjs](https://expressjs.com/)

* [MySQL](mysql)

* [Sequelize / Sequelize cli](https://sequelize.org/)
