'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CREATE_JOB, PUBLISH_JOB } from '@/lib/graphql/queries';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect } from 'react';

const jobSchema = z.object({
  title: z.string().min(5, 'Название должно содержать минимум 5 символов'),
  description: z.string().min(100, 'Описание должно содержать минимум 100 символов'),
  requirements: z.string().min(10, 'Укажите хотя бы одно требование'),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  currency: z.string().default('USD'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  location: z.string().min(1, 'Местоположение обязательно'),
  remote: z.boolean().default(false),
  category: z.string().min(1, 'Категория обязательна'),
  experienceLevel: z.enum(['junior', 'middle', 'senior', 'lead']),
  skills: z.string().min(1, 'Укажите хотя бы один навык'),
});

type JobForm = z.infer<typeof jobSchema>;

export default function NewJobPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const [createJob, { loading }] = useMutation(CREATE_JOB);
  const [publishJob] = useMutation(PUBLISH_JOB);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      currency: 'USD',
      remote: false,
    },
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'employer') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: JobForm) => {
    try {
      const requirements = data.requirements.split('\n').filter((r) => r.trim());
      const skills = data.skills.split(',').map((s) => s.trim()).filter((s) => s);

      const result = await createJob({
        variables: {
          input: {
            ...data,
            requirements,
            skills,
          },
        },
      });

      if (result.data?.createJob) {
        await publishJob({
          variables: { id: result.data.createJob.id },
        });
        router.push('/dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create job');
    }
  };

  if (!isAuthenticated || user?.role !== 'employer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <a href="/" className="flex items-center text-2xl font-bold text-primary-600">
              JobConnect
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Разместить вакансию</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название вакансии *
            </label>
            <input {...register('title')} type="text" className="input" />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              {...register('description')}
              rows={8}
              className="input"
              placeholder="Опишите должность, обязанности и что вы ищете..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Требования * (по одному на строку)
            </label>
            <textarea
              {...register('requirements')}
              rows={6}
              className="input"
              placeholder="5+ лет опыта...&#10;Хорошее знание..."
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Минимальная зарплата
              </label>
              <input {...register('salaryMin', { valueAsNumber: true })} type="number" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Максимальная зарплата
              </label>
              <input {...register('salaryMax', { valueAsNumber: true })} type="number" className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип занятости *
              </label>
              <select {...register('employmentType')} className="input">
                <option value="full-time">Полная занятость</option>
                <option value="part-time">Частичная занятость</option>
                <option value="contract">Контракт</option>
                <option value="internship">Стажировка</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Уровень опыта *
              </label>
              <select {...register('experienceLevel')} className="input">
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Местоположение *
            </label>
            <input {...register('location')} type="text" className="input" placeholder="Город, Страна" />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория *
            </label>
            <input
              {...register('category')}
              type="text"
              className="input"
              placeholder="Например, Разработка ПО"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Навыки * (через запятую)
            </label>
            <input
              {...register('skills')}
              type="text"
              className="input"
              placeholder="React, TypeScript, Node.js"
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center">
              <input {...register('remote')} type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-700">Доступна удалённая работа</span>
            </label>
          </div>

          <div className="flex space-x-4">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Создание...' : 'Создать и опубликовать вакансию'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

