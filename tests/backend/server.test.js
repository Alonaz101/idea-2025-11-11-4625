const request = require('supertest');
const express = require('express');
const app = require('../backend/server');

// Note: This assumes that the backend/server.js exports the app instance. If not, it should be modified accordingly.

describe('API routes', () => {
  describe('GET /', () => {
    it('should respond with 200 and welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toMatch(/welcome/i);
    });
  });

  describe('POST /items', () => {
    it('should create a new item with valid data', async () => {
      const res = await request(app)
        .post('/items')
        .send({ name: 'Test item', description: 'This is a test item' })
        .set('Accept', 'application/json');
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test item');
    });

    it('should fail to create item with missing name', async () => {
      const res = await request(app)
        .post('/items')
        .send({ description: 'Missing name field' })
        .set('Accept', 'application/json');
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail to create item with invalid payload', async () => {
      const res = await request(app)
        .post('/items')
        .send('this is not json')
        .set('Accept', 'application/json');
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /items/:id', () => {
    it('should retrieve an item by id', async () => {
      const postRes = await request(app)
        .post('/items')
        .send({ name: 'getItemTest', description: 'Testing get by ID' })
        .set('Accept', 'application/json');
      const itemId = postRes.body.id;

      const getRes = await request(app).get(`/items/${itemId}`);
      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body).toHaveProperty('id', itemId);
    });

    it('should respond 404 for non-existing item', async () => {
      const res = await request(app).get('/items/999999');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /items/:id', () => {
    it('should update an existing item', async () => {
      const postRes = await request(app)
        .post('/items')
        .send({ name: 'updateTest', description: 'To update' })
        .set('Accept', 'application/json');
      const itemId = postRes.body.id;

      const putRes = await request(app)
        .put(`/items/${itemId}`)
        .send({ name: 'updatedName' })
        .set('Accept', 'application/json');
      expect(putRes.statusCode).toEqual(200);
      expect(putRes.body).toHaveProperty('name', 'updatedName');
    });

    it('should respond 400 for invalid update payload', async () => {
      const putRes = await request(app)
        .put('/items/1')
        .send({ invalidField: 'invalidValue' })
        .set('Accept', 'application/json');
      expect(putRes.statusCode).toEqual(400);
    });

    it('should respond 404 when updating non-existing item', async () => {
      const putRes = await request(app)
        .put('/items/999999')
        .send({ name: 'noItem' })
        .set('Accept', 'application/json');
      expect(putRes.statusCode).toEqual(404);
    });
  });

  describe('DELETE /items/:id', () => {
    it('should delete an existing item', async () => {
      const postRes = await request(app)
        .post('/items')
        .send({ name: 'deleteTest', description: 'Delete me' })
        .set('Accept', 'application/json');
      const itemId = postRes.body.id;

      const delRes = await request(app).delete(`/items/${itemId}`);
      expect(delRes.statusCode).toEqual(204);

      // Confirm deletion
      const getRes = await request(app).get(`/items/${itemId}`);
      expect(getRes.statusCode).toEqual(404);
    });

    it('should respond 404 when deleting non-existing item', async () => {
      const res = await request(app).delete('/items/999999');
      expect(res.statusCode).toEqual(404);
    });
  });
});
