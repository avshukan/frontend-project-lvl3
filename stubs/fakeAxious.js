class FakeAxios {
  constructor(status, data) {
    this.status = status;
    this.data = data;
  }

  get = () => Promise.resolve({ status: this.status, data: this.data });
}

export default FakeAxios;
