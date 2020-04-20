import request from 'supertest';
import app from '../../src/app';

const baseRepository = {
  url: 'https://github.com/ruverd/express-api-boilerplate',
  title: 'express-api-boilerplate',
  techs: ['Node', 'Express', 'TypeScript'],
};

describe('Likes', () => {
  it('should be able to give a like to the repository', async () => {
    const repository = await request(app)
      .post('/repositories')
      .send(baseRepository);

    let response = await request(app).post(
      `/repositories/${repository.body.id}/like`
    );

    expect(response.body).toMatchObject({
      likes: 1,
    });

    response = await request(app).post(
      `/repositories/${repository.body.id}/like`
    );

    expect(response.body).toMatchObject({
      likes: 2,
    });
  });

  it('should not be able to like a repository that does not exist', async () => {
    await request(app).post(`/repositories/123/like`).expect(404);
  });
});
