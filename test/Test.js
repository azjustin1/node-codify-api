import dotenv from "dotenv";
// import agent from "./chaiConfig";
import User from "../models/User";
import app from "../server";
import chai from "chai";
import chaiHttp from "chai-http";

chai.should();
chai.use(chaiHttp);

dotenv.config();

let accessToken = "";

describe("Signin Test", () => {
  it("Connect to API /", (done) => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it("Should return a token", (done) => {
    const user = { email: "azjustin3@gmail.com", password: "123456" };
    chai
      .request(app)
      .post("/signin")
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("accessToken");
        done();
      });
  });
});

describe("After signin", () => {
  before((done) => {
    const user = { email: "azjustin3@gmail.com", password: "123456" };
    chai
      .request(app)
      .post("/signin")
      .send(user)
      .end((err, res) => {
        accessToken = `Bearer ${res.body.accessToken}`;
        done();
      });
  });

  it("Get user profile", (done) => {
    chai
      .request(app)
      .get("/user/profile")
      .set("authorization", accessToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("email");
        res.body.should.have.property("password");
        res.body.should.have.property("active");
        done();
      });
  });
  it()
});
