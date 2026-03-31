import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 with { status: "ok" }', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });

  describe('POST /reviews', () => {
    it('should return 201 with { id } for valid input', async () => {
      const response = await request(app.getHttpServer())
        .post('/reviews')
        .send({
          language: 'typescript',
          code: 'const x = 1;',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should return 201 with optional context field', async () => {
      const response = await request(app.getHttpServer())
        .post('/reviews')
        .send({
          language: 'javascript',
          code: 'let a = 2;',
          context: 'Test context',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for invalid language', async () => {
      const response = await request(app.getHttpServer())
        .post('/reviews')
        .send({
          language: 'ruby',
          code: 'puts 1',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('language must be one of'),
        ]),
      );
    });

    it('should return 400 for empty code', async () => {
      const response = await request(app.getHttpServer())
        .post('/reviews')
        .send({
          language: 'typescript',
          code: '',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('code must not be empty'),
        ]),
      );
    });

    it('should return 400 for missing code field', async () => {
      const response = await request(app.getHttpServer())
        .post('/reviews')
        .send({
          language: 'typescript',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for unknown fields (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/reviews')
        .send({
          language: 'typescript',
          code: 'const x = 1;',
          unknown: 'field',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /reviews/:id', () => {
    it('should return 200 with review result for a valid id', async () => {
      // First create a review
      const createResponse = await request(app.getHttpServer())
        .post('/reviews')
        .send({
          language: 'python',
          code: 'print("hello")',
        })
        .expect(201);

      const { id } = createResponse.body;

      // Then fetch it
      const response = await request(app.getHttpServer())
        .get(`/reviews/${id}`)
        .expect(200);

      expect(response.body.id).toBe(id);
      expect(response.body.status).toBe('done');
      expect(response.body.result).toHaveProperty('summary');
      expect(response.body.result).toHaveProperty('positives');
      expect(response.body.result).toHaveProperty('issues');
      expect(response.body.result).toHaveProperty('suggestions');
      expect(response.body.result).toHaveProperty('questions');
      expect(response.body.result).toHaveProperty('overallScore');
      expect(response.body.result.overallScore).toBe(6);
      expect(response.body.result.positives).toHaveLength(2);
      expect(response.body.result.issues).toHaveLength(3);
      expect(response.body.result.suggestions).toHaveLength(3);
      expect(response.body.result.questions).toHaveLength(2);
    });

    it('should return 404 for a non-existent id', () => {
      return request(app.getHttpServer())
        .get('/reviews/00000000-0000-4000-a000-000000000000')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Review not found');
          expect(res.body.statusCode).toBe(404);
        });
    });
  });
});
