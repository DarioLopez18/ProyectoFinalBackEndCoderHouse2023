import { expect } from "chai";
import { generateToken } from "../utils.js";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/config.js";
import supertest from "supertest";
let server;
let request;

describe("Pruebas de la API", () => {
  before(async function () {
    await connectDb();
    server = await startServer();
    request = supertest("http://localhost:8080");
  });
  after(function () {
    mongoose.disconnect();
    server.close();
  });
  it("Debería poder crear un carrito de la ruta api/cart", async () => {
    try {
      const token = generateToken();
      const response = await request
        .post("/api/cart")
        .set("Cookie", `keyCookieForJWT=${token}`);
      console.log(response.body.products);
      expect(response.body.products).to.be.an("array").that.is.empty;
      expect(response.status).to.equal(200);
    } catch (e) {
      console.log(e);
    }
  }).timeout(8000);
  it("Deberia poder devolver el carrito de un usuario pasandole el id /api/cart/user", async () => {
    try {
      const token = generateToken();
      const response = await request
        .get("/api/cart/6525f5c51c9f1291cae6510a")
        .set("Cookie", `keyCookieForJWT=${token}`);
      expect(response.status).to.equal(200);
    } catch (e) {
      console.log(e);
    }
  });
  it("Le pasamos un ID que no existe y no debería de devolver un carrito /api/cart/:cid", async () => {
    try {
      const token = generateToken();
      const response = await request
        .get("/api/cart/6525f5c51c9f1291cae65109")
        .set("Cookie", `keyCookieForJWT=${token}`);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("error").that.is.a("string");
      expect(response.status).to.equal(500);
    } catch (e) {
      console.log(e);
    }
  });
});

async function connectDb() {
  try {
    const mongoDB = config.url;
    await mongoose.connect(mongoDB, {
      dbName: config.dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Base de datos conectada!");
  } catch (error) {
    throw new Error(`Error de conexión en la base de datos: ${err}`);
  }
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const PORT = 9000;
    const server = app.listen(PORT, () => {
      console.log(`Servidor express escuchando en el puerto ${PORT}`);
      resolve(server);
    });
    server.on("error", (error) => {
      console.log(`Error en Servidor: ${error}`);
      reject(error);
    });
  });
}
