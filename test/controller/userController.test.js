
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../app');
const userService = require('../../service/userService');

const { expect } = chai;

describe('UserController', () => {
    let registerStub, loginStub;

    afterEach(() => {
        sinon.restore();
    });

    it('deve registrar usuário com sucesso', async () => {
        registerStub = sinon.stub(userService, 'registerUser').resolves({ login: 'user1' });
        const res = await request(app)
            .post('/api/users/register')
            .send({ login: 'user1', password: '1234' });
        expect(res.status).to.equal(201);
        expect(res.body).to.deep.equal({ login: 'user1' });
        expect(registerStub.calledOnce).to.be.true;
    });

    it('deve retornar erro se login não for informado', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ password: '1234' });
        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/obrigat/);
    });

    it('deve retornar erro se senha não for informada', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ login: 'user2' });
        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/obrigat/);
    });

    it('deve retornar erro se usuário já existe', async () => {
        registerStub = sinon.stub(userService, 'registerUser').rejects(new Error('Usuário já registrado.'));
        const res = await request(app)
            .post('/api/users/register')
            .send({ login: 'user1', password: '1234' });
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Usuário já registrado.');
        expect(registerStub.calledOnce).to.be.true;
    });

    it('deve realizar login com sucesso', async () => {
        loginStub = sinon.stub(userService, 'loginUser').resolves({ login: 'user1' });
        const res = await request(app)
            .post('/api/users/login')
            .send({ login: 'user1', password: '1234' });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Login realizado com sucesso');
        expect(res.body.user).to.deep.equal({ login: 'user1' });
        expect(loginStub.calledOnce).to.be.true;
    });
});