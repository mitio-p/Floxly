class Auth {
  constructor() {
    this.accessToken = null;
  }

  getToken() {
    return this.accessToken;
  }

  setToken(token) {
    this.accessToken = token;
  }
}

const tokenSevice = new Auth();
export default tokenSevice;
