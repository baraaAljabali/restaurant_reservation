const request = require("supertest");
const app = require("../app");

/*
  get Token before all tests
  */
let token;

beforeAll((done) => {
  request(app)
    .post('/api-user/login')
    .send({
      empNum: "0002",
      password: "123456",
    })
    .end((err, response) => {
      token = response.body.token; // save the token!
      done();
    });
});

describe("GET /api-reservation/all-reservations ", () => {
  test("It should respond with 'Not Found' since there is no page",
  async () => {
    const response = await request(app)
    .get("/api-reservation/all-reservations");

    expect(response.body).toEqual('Not Found');
    expect(response.statusCode).toBe(404);
  });
});


describe("GET /api-reservation/all-reservations/:page ", () => {
  test("It should respond 'access denied'; "
    + "since employee role should not be allowed",
  async () => {
    const response = await request(app)
    .get("/api-reservation/all-reservations/1")
    .set('Authorization', `Bearer ${token}`);

    expect(response.body).toHaveProperty("message");
    expect(response.statusCode).toBe(401);
  });
});

describe("GET /api-reservation/all-reservations-today/:timeOrder/:page ",
  () => {
    test("It should respond with array of reservations",
    async () => {
      const response = await request(app)
      .get("/api-reservation/all-reservations-today/DESC/1")
      .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty("reservations");
      expect(Array.isArray(response.body.reservations)).toEqual(true);

      expect(response.body).toHaveProperty("nextPage");
      expect(response.body).toHaveProperty("hasNextPage");

      expect(response.statusCode).toBe(200);
  });
});

describe("GET /api-reservation/all-reservations-today/:timeOrder/:page ",
  () => {
    test("Sending invalid timeOrder; It should responce with error",
    async () => {
      const response = await request(app)
      .get("/api-reservation/all-reservations-today/DC/1")
      .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');

      expect(response.statusCode).toBe(500);
  });
});

describe("GET /api-reservation/all-reservations-by-date/"
  + ":page?from=val&to=val2",
  () => {
    test("It should respond 'access denied'; "
      + "since employee role should not be allowed",
    async () => {
      const response = await request(app)
      .get("/api-reservation/all-reservations-by-date/"
        + "1?from=03/16/2022&to=12/18/2022")
      .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty("message");
      expect(response.statusCode).toBe(401);
  });
});

describe("GET /api-reservation/all-reservations-by-tables/:tables/:page",
  () => {
    test("It should respond 'access denied'; "
      + "since employee role should not be allowed",
    async () => {
      const response = await request(app)
      .get("/api-reservation/all-reservations-by-tables/1,2/1")
      .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty("message");
      expect(response.statusCode).toBe(401);
  });
});

describe("GET /api-reservation/time-slots/:seats",
  () => {
    test("It should respond with array of time slots",
    async () => {
      const response = await request(app)
      .get("/api-reservation/time-slots/3")
      .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty("timeSlots");
      expect(typeof response.body.timeSlots).toEqual("object");

      expect(response.statusCode).toBe(200);
  });
});

describe("GET /api-reservation/time-slots/:seats",
  () => {
    test("Sending invalid seats number; It should respond with error",
    async () => {
      const response = await request(app)
      .get("/api-reservation/time-slots/03")
      .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty('error');
      expect(response.statusCode).toBe(422);
  });
});

describe("POST /api-reservation/new-reservation",
  () => {
    test("Sending invalid customer name; It should respond with error",
    async () => {
      const response = await request(app)
      .post("/api-reservation/new-reservation")
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: "sara ali11",
        mobile: "0535225744",
        timeStart: "07:30 pm",
        timeEnd: "08:00 pm",
        table: "2"
      })
      expect(response.body).toHaveProperty('error');
      expect(response.statusCode).toBe(422);
  });
});

describe("POST /api-reservation/new-reservation",
  () => {
    test("Sending invalid mobile number; It should respond with error",
    async () => {
      const response = await request(app)
      .post("/api-reservation/new-reservation")
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: "sara ali",
        mobile: "05225744",
        timeStart: "07:30 pm",
        timeEnd: "08:00 pm",
        table: "2"
      })
      expect(response.body).toHaveProperty('error');
      expect(response.statusCode).toBe(422);
  });
});

describe("POST /api-reservation/new-reservation",
  () => {
    test("Sending invalid time start; It should respond with error",
    async () => {
      const response = await request(app)
      .post("/api-reservation/new-reservation")
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: "sara ali",
        mobile: "0535225744",
        timeStart: "07:30pm",
        timeEnd: "08:00 pm",
        table: "2"
      })
      expect(response.body).toHaveProperty('error');
      expect(response.statusCode).toBe(422);
  });
});

describe("POST /api-reservation/new-reservation",
  () => {
    test("Sending invalid time end; It should respond with error",
    async () => {
      const response = await request(app)
      .post("/api-reservation/new-reservation")
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: "sara ali",
        mobile: "0535225744",
        timeStart: "07:30 pm",
        timeEnd: "08:00",
        table: "2"
      })
      expect(response.body).toHaveProperty('error');
      expect(response.statusCode).toBe(422);
  });
});

describe("POST /api-reservation/new-reservation",
  () => {
    test("Not sending table number; It should respond with error",
    async () => {
      const response = await request(app)
      .post("/api-reservation/new-reservation")
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: "sara ali",
        mobile: "0535225744",
        timeStart: "07:30 pm",
        timeEnd: "08:00",
        table: "02"
      })
      expect(response.body).toHaveProperty('error');
      expect(response.statusCode).toBe(422);
  });
});

/**
 * If database has a reservation that conflicts values passed to this test case
 * It will return conflict, thats why calling the api with the same values 
 * returens expected conflict in the next test
 */
describe("POST /api-reservation/new-reservation",
  () => {
    test("It should respond with success confermation message",
    async () => {
      const response = await request(app)
      .post("/api-reservation/new-reservation")
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: "sara ali",
        mobile: "0535225744",
        timeStart: "11:33 pm",
        timeEnd: "11:59 pm",
        table: "2"
      })
      expect(response.body).toHaveProperty('message');
      expect(response.statusCode).toBe(200);
  });
});

describe("POST /api-reservation/new-reservation",
  () => {
    test("It should respond with error for conflict",
    async () => {
      const response = await request(app)
      .post("/api-reservation/new-reservation")
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: "sara ali",
        mobile: "0535225744",
        timeStart: "11:33 pm",
        timeEnd: "11:59 pm",
        table: "2"
      })
      expect(response.body).toHaveProperty('error');
      expect(response.statusCode).toBe(409);
  });
});

describe("DELETE /api-reservation/cancel-reservation/:serial",
  () => {
    test("It should respond with message confirming deletion",
    async () => {
      const response = await request(app)
      .delete("/api-reservation/cancel-reservation/2")
      .set('Authorization', `Bearer ${token}`)

      expect(response.body).toHaveProperty('message');
      expect(response.statusCode).toBe(200);
  });
});

describe("DELETE /api-reservation/cancel-reservation/:serial",
  () => {
    test("It should respond with message explainig rejection of deletion",
    async () => {
      const response = await request(app)
      .delete("/api-reservation/cancel-reservation/16")
      .set('Authorization', `Bearer ${token}`)

      expect(response.body).toHaveProperty('message');
      expect(response.statusCode).toBe(403);
  });
});