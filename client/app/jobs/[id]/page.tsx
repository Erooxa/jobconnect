'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_JOB, CREATE_APPLICATION } from '@/lib/graphql/queries';
import { useAuthStore } from '@/lib/store/authStore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const applicationSchema = z.object({
  coverLetter: z.string().min(50, 'Сопроводительное письмо должно содержать минимум 50 символов'),
  resume: z.string().optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const { data, loading, error } = useQuery(GET_JOB, {
    variables: { id: jobId },
    skip: !jobId,
  });
  const [createApplication, { loading: submitting }] = useMutation(CREATE_APPLICATION);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (formData: ApplicationForm) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await createApplication({
        variables: {
          input: {
            jobId,
            ...formData,
          },
        },
      });
      alert('Заявка успешно отправлена!');
      setShowApplicationForm(false);
    } catch (err: any) {
      alert(err.message || 'Не удалось отправить заявку');
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Ошибка: {error.message}</div>;
  if (!data?.job) return <div className="container mx-auto px-4 py-8">Вакансия не найдена</div>;

  const job = data.job;

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
          <p className="text-primary-600 text-lg font-medium mb-4">{job.company.name}</p>
          <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
            <span>{job.location}</span>
            {job.remote && <span>• Удалённо</span>}
            <span>• {job.employmentType === 'full-time' ? 'Полная занятость' : job.employmentType === 'part-time' ? 'Частичная занятость' : job.employmentType === 'contract' ? 'Контракт' : 'Стажировка'}</span>
            <span>• {job.experienceLevel === 'junior' ? 'Junior' : job.experienceLevel === 'middle' ? 'Middle' : job.experienceLevel === 'senior' ? 'Senior' : 'Lead'}</span>
            {job.salaryMin && (
              <span>
                • ${job.salaryMin.toLocaleString()}
                {job.salaryMax && ` - $${job.salaryMax.toLocaleString()}`} {job.currency}
              </span>
            )}
          </div>

          {isAuthenticated && user?.role === 'candidate' && !showApplicationForm && (
            <button
              onClick={() => setShowApplicationForm(true)}
              className="btn btn-primary"
            >
              Откликнуться
            </button>
          )}

          {!isAuthenticated && (
            <a href="/login" className="btn btn-primary">
              Войти для отклика
            </a>
          )}
        </div>

        {showApplicationForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Отправить заявку</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сопроводительное письмо *
                </label>
                <textarea
                  {...register('coverLetter')}
                  rows={6}
                  className="input"
                  placeholder="Расскажите, почему вы подходите на эту должность..."
                />
                {errors.coverLetter && (
                  <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ссылка на резюме (необязательно)
                </label>
                <input
                  {...register('resume')}
                  type="url"
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Отправка...' : 'Отправить заявку'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Описание вакансии</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Требования</h2>
          <ul className="list-disc list-inside space-y-2">
            {job.requirements.map((req: string, idx: number) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Навыки</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill: string) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">О компании {job.company.name}</h2>
          <p className="text-gray-700 mb-4">{job.company.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Отрасль: {job.company.industry}</span>
            <span>Размер: {job.company.size === 'startup' ? 'Стартап' : job.company.size === 'small' ? 'Маленькая' : job.company.size === 'medium' ? 'Средняя' : job.company.size === 'large' ? 'Большая' : 'Корпорация'}</span>
            <span>Местоположение: {job.company.location}</span>
            {job.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Сайт
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

