# APIs Manage Class

## General Settings
```
endpoint: https://midtermclassapi.herokuapp.com
```
```javascript
headers: { 
    "Content-Type": "application/json",
    "Authorization": "Bearer <access_token>"
}
```




### User register
`POST` /user/register

```json
{
    "username": "khoi_pro",
    "password": "1234567",
    "email": "khoi@gmail.com",
    "fullname": "Khoi Nguyen"
}
```

### User login
`POST` /user/login

```json
{
    "username": "khoi",
    "password": "1234567",
}
```

### User info
`GET` /user/info

### User logout
`GET` /user/logout

### User authenticate
`GET` /user/authenticate

### Create class
`POST` /class/create

```json
{
    "name": "class 1",
    "description": "des 1",
    "ownerId": "12121212" // id of user
}
```

### Get all class of user
`GET` /class/me

### Get class by ID
`GET` /class/me/id

### Get user info by ID
`GET` /user/info/id