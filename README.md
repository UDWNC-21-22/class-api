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

---

## User

#### User register
`POST` /user/register

```json
{
    "username": "khoi_pro",
    "password": "1234567",
    "email": "khoi@gmail.com",
    "fullname": "Khoi Nguyen"
}
```

#### User login
`POST` /user/login

```json
{
    "username": "khoi",
    "password": "1234567",
}
```

#### User info
`GET` /user/info

#### User logout
`GET` /user/logout

#### User authenticate
`GET` /user/authenticate

#### Get user info by ID
`GET` /user/info/id

---

## Class
#### Create class
`POST` /class/create

```json
{
    "name": "class 1",
    "description": "des 1",
}
```

#### Update class by ID
`PUT` /class/update
```json
{
    "classId": "6194dd30-4532-11ec-afd2-f12a0e290957",
    "name": "class 1 - edit lan 3",
    "description": "hi"
}
```

#### Get all class of user
`GET` /class/me

#### Get class by ID
`GET` /class/me/id

#### Delete class by ID
`DELETE` /class/delete
```json
{
    "classId": "6194dd30-4532-11ec-afd2-f12a0e290957"
}
```

## Grade
#### Get grade
`GET` /grade/:classId

#### Post grade
```json
{
    "classId": "4c81d9f0-47af-11ec-840e-93895d593299",
    "memberId": "4aa6b440-45e1-11ec-a1e0-43425fae68bd",
    "grade": 10
}
```



#### email
midtermweb1@gmail.com  
12@abcdef