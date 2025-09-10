// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the database before tests
});

afterAll(async () => {
    await sequelize.close(); // Close the database connection after tests
});

describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.user).toHaveProperty('id');
    });

    it('should log in an existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('token');
    });

    it('should fail to log in with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('success', false);
    });
});