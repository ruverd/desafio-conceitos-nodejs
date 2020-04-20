import request from 'supertest';
import { isUuid } from 'uuidv4';
import app from '../../src/app';

const baseRepository = {
  url: 'https://github.com/ruverd/express-api-boilerplate',
  title: 'express-api-boilerplate',
  techs: ['Node', 'Express', 'TypeScript'],
};

describe('Repositories', () => {
  it('should be able to create a new repository', async () => {
    const response = await request(app)
      .post('/repositories')
      .send(baseRepository);

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      ...baseRepository,
      likes: 0,
    });
  });

  it('should be able to list the repositories', async () => {
    const repository = await request(app)
      .post('/repositories')
      .send(baseRepository);

    const response = await request(app).get('/repositories');

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: repository.body.id,
          url: baseRepository.url,
          title: baseRepository.title,
          techs: baseRepository.techs,
          likes: 0,
        },
      ])
    );
  });

  it('should be able to update repository', async () => {
    const repository = await request(app)
      .post('/repositories')
      .send(baseRepository);

    const newRepository = {
      ...baseRepository,
      title: 'New Title',
    };

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send(newRepository);

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject(newRepository);
  });

  it('should not be able to update a repository that does not exist', async () => {
    await request(app).put(`/repositories/123`).expect(404);
  });

  it('should not be able to update repository likes manually', async () => {
    const repository = await request(app)
      .post('/repositories')
      .send(baseRepository);

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        likes: 15,
      });

    expect(response.body).toMatchObject({
      likes: 0,
    });
  });

  it('should be able to delete the repository', async () => {
    const response = await request(app)
      .post('/repositories')
      .send(baseRepository);

    await request(app).delete(`/repositories/${response.body.id}`).expect(204);

    const repositories = await request(app).get('/repositories');

    const repository = repositories.body.find((r) => r.id === response.body.id);

    expect(repository).toBeUndefined();
  });

  it('should not be able to delete a repository that does not exist', async () => {
    await request(app).delete(`/repositories/123`).expect(404);
  });
});
