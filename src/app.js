import express from 'express';
import cors from 'cors';

import { uuid, isUuid } from 'uuidv4';

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

/* Middleware sends a message if likes on req.body */
function likesMiddleware(req, res, next) {
  const hasLikes = req.body.likes;
  if (hasLikes) {
    return res.status(400).json({ likes: 0 });
  }
  return next();
}

/* Middleware responsible to verificate if ID of repository exists and if it is valid  */
function idVerificationMiddleware(req, res, next) {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Invalid ID' });
  }

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );

  if (repositoryIndex < 0) {
    return res.status(404).json({ error: 'Register not found' });
  }

  req.repositoryIndex = repositoryIndex;
  req.repository = repositories[repositoryIndex];

  return next();
}

app.use(likesMiddleware);

app.get('/', (req, res) => {
  res.json({ message: '🚀 #rocketseat #desafio-conceitos-nodejs 🚀' });
});

app.get('/repositories', (req, res) => {
  const { title } = req.query;
  const result = title
    ? repositories.filter((repository) => repository.title.includes(title))
    : repositories;

  return res.json(result);
});

app.get('/repositories/:id', idVerificationMiddleware, (req, res) => {
  return res.json(req.repository);
});

app.post('/repositories', (req, res) => {
  const { title, url, techs } = req.body;

  const id = uuid();

  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Invalid ID' });
  }

  const repository = {
    id,
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return res.json(repository);
});

app.put('/repositories/:id', idVerificationMiddleware, (req, res) => {
  const { title, url, techs } = req.body;

  const { id, likes } = req.repository;

  const repository = {
    id,
    title,
    url,
    techs,
    likes,
  };

  repositories[req.repositoryIndex] = repository;

  return res.json(repository);
});

app.delete('/repositories/:id', idVerificationMiddleware, (req, res) => {
  repositories.splice(req.repositoryIndex, 1);

  return res.status(204).send();
});

app.post('/repositories/:id/like', idVerificationMiddleware, (req, res) => {
  const { likes, ...rest } = req.repository;

  const repository = {
    ...rest,
    likes: likes + 1,
  };

  repositories[req.repositoryIndex] = repository;

  return res.json(repository);
});

export default app;
