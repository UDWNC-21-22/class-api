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
`POST` : /user/register

```json
{
    "username": "khoi_pro",
    "password": "1234567",
    "email": "khoi@gmail.com",
    "fullname": "Khoi Nguyen"
}
```

### User login
`POST` : /user/login

```json
{
    "username": "khoi_pro",
    "password": "1234567",
}
```

### User authenticate
`GET` : /user/authenticate
