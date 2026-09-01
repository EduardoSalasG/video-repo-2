import { describe, it, expect } from 'vitest';
import { User, Course, Section, VideoMetadata } from './entities';
import { Role, Difficulty, PrimaryStyle, VideoType } from './enums';

describe('Domain entities', () => {
  it('creates a user with role', () => {
    const user = new User({ email: 'test@dance.com', role: Role.STUDENT });
    expect(user.email).toBe('test@dance.com');
    expect(user.role).toBe(Role.STUDENT);
  });

  it('creates a course with name', () => {
    const course = new Course({ name: 'Salsa Nivel 1' });
    expect(course.name).toBe('Salsa Nivel 1');
  });

  it('creates a section with markdown content', () => {
    const section = new Section({ title: 'Conteo', markdownContent: '# Ritmo' });
    expect(section.title).toBe('Conteo');
    expect(section.markdownContent).toBe('# Ritmo');
  });

  it('creates video metadata with steps and tags', () => {
    const metadata = new VideoMetadata({
      sectionId: 'section-1',
      difficulty: Difficulty.BEGINNER,
      primaryStyle: PrimaryStyle.CASINO,
      videoType: VideoType.STEP,
      durationCounts: 8,
      steps: ['paso básico'],
      influences: ['cubano'],
      tags: ['salsa'],
    });
    expect(metadata.difficulty).toBe(Difficulty.BEGINNER);
    expect(metadata.steps).toContain('paso básico');
  });
});
