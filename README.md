# Opalstack CLI [![Opalstack CLI][npm-img]][npm-link]

Opalstack CLI is a simple CLI to do some Opalstack actions without the need of a browser using their [API](https://docs.opalstack.com/user-guide/api/)

Login through CLI

<p align="center">
  <img src="./img/Opal1.png" alt="Login through CLI" width="621">
</p>

Add an email

<p align="center">
  <img src="./img/Opal2.png" alt="Add an email through CLI" width="621">
</p>

Receive information about your operation

<p align="center">
  <img src="./img/Opal3.png" alt="Receive info from operations" width="621">
</p>

[npm-img]: https://img.shields.io/npm/v/opalstack-cli?style=flat-square
[npm-link]: https://www.npmjs.com/package/opalstack-cli

## Usage

https://user-images.githubusercontent.com/1919322/183150911-b29f2258-2783-4d89-a5fe-15fd032f8536.mp4

Install

```bash
$ npm install -g opalstack-cli
```

you will be asked to log in if you haven't already done it, otherwise it'll take credentials from your credentials file locally

### Call commands directly

```bash
$ opalstack-cli --help
Opalstack CLI
add:
         opalstack-cli add email <username> <email>

$ opalstack-cli add email test_username test@email.com
```

### Current operations

- Add an email
- More to come ...
