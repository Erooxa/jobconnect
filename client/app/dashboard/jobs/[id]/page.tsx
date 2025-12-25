'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_JOB, GET_JOB_APPLICATIONS, UPDATE_APPLICATION } from '@/lib/graphql/queries';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function JobDetailDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  const { data: jobData, loading: jobLoading, error: jobError } = useQuery(GET_JOB, {
    variables: { id: jobId },
    skip: !jobId,
  });

  const { data: applicationsData, loading: applicationsLoading, refetch } = useQuery(
    GET_JOB_APPLICATIONS,
    {
      variables: { jobId },
      skip: !jobId,
    }
  );

  const [updateApplication, { loading: updating }] = useMutation(UPDATE_APPLICATION);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'employer') {
      router.push('/jobs');
    }
  }, [isAuthenticated, user, router]);

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      await updateApplication({
        variables: {
          id: applicationId,
          input: {
            status,
            notes: notes[applicationId] || undefined,
          },
        },
      });
      setSelectedStatus({ ...selectedStatus, [applicationId]: status });
      refetch();
      alert('Статус заявки обновлен');
    } catch (err: any) {
      alert(err.message || 'Не удалось обновить статус заявки');
    }
  };

  if (jobLoading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">Загрузка...</div>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">Ошибка: {jobError.message}</div>
      </div>
    );
  }

  if (!jobData?.job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">Вакансия не найдена</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'employer') {
    return null;
  }

  const job = jobData.job;
  const applications = applicationsData?.jobApplications || [];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'На рассмотрении',
      reviewed: 'Просмотрено',
      interview: 'Собеседование',
      rejected: 'Отклонено',
      accepted: 'Принято',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center text-2xl font-bold text-primary-600">
              JobConnect
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="btn btn-secondary">
                Мои вакансии
              </Link>
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                  router.push('/');
                }}
                className="btn btn-secondary"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
            ← Назад к списку вакансий
          </Link>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <p className="text-primary-600 text-lg font-medium mb-4">{job.company.name}</p>
            </div>
            <span
              className={`px-3 py-1 rounded text-sm ${
                job.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : job.status === 'draft'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {job.status === 'published' ? 'Опубликовано' : job.status === 'draft' ? 'Черновик' : 'Закрыто'}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
            <span>{job.location}</span>
            {job.remote && <span>• Удалённо</span>}
            <span>
              • {job.employmentType === 'full-time'
                ? 'Полная занятость'
                : job.employmentType === 'part-time'
                ? 'Частичная занятость'
                : job.employmentType === 'contract'
                ? 'Контракт'
                : 'Стажировка'}
            </span>
            <span>
              • {job.experienceLevel === 'junior'
                ? 'Junior'
                : job.experienceLevel === 'middle'
                ? 'Middle'
                : job.experienceLevel === 'senior'
                ? 'Senior'
                : 'Lead'}
            </span>
            {job.salaryMin && (
              <span>
                • ${job.salaryMin.toLocaleString()}
                {job.salaryMax && ` - $${job.salaryMax.toLocaleString()}`} {job.currency}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-600">Заявок:</span>
              <span className="ml-2 font-semibold">{job.applicationsCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Просмотров:</span>
              <span className="ml-2 font-semibold">{job.viewsCount}</span>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Описание вакансии</h2>
            <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Требования</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {job.requirements.map((req: string, idx: number) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Навыки</h2>
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
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Заявки на вакансию ({applications.length})</h2>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Пока нет заявок на эту вакансию</p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application: any) => (
                <div key={application.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {application.candidate.firstName} {application.candidate.lastName}
                      </h3>
                      <p className="text-gray-600 mb-2">{application.candidate.email}</p>
                      {application.candidate.skills && application.candidate.skills.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Навыки: </span>
                          <span className="text-sm text-gray-800">
                            {application.candidate.skills.join(', ')}
                          </span>
                        </div>
                      )}
                      {application.candidate.experience && (
                        <p className="text-sm text-gray-600">
                          Опыт: {application.candidate.experience} лет
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm ${getStatusColor(application.status)}`}
                    >
                      {getStatusLabel(application.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Сопроводительное письмо:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                      {application.coverLetter}
                    </p>
                  </div>

                  {application.resume && (
                    <div className="mb-4">
                      <a
                        href={application.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        Открыть резюме →
                      </a>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Заметки:
                    </label>
                    <textarea
                      value={notes[application.id] || application.notes || ''}
                      onChange={(e) =>
                        setNotes({ ...notes, [application.id]: e.target.value })
                      }
                      rows={3}
                      className="input w-full"
                      placeholder="Добавьте заметки о кандидате..."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Изменить статус:</label>
                    <select
                      value={selectedStatus[application.id] || application.status}
                      onChange={(e) => {
                        setSelectedStatus({ ...selectedStatus, [application.id]: e.target.value });
                        handleStatusChange(application.id, e.target.value);
                      }}
                      disabled={updating}
                      className="input"
                    >
                      <option value="pending">На рассмотрении</option>
                      <option value="reviewed">Просмотрено</option>
                      <option value="interview">Собеседование</option>
                      <option value="rejected">Отклонено</option>
                      <option value="accepted">Принято</option>
                    </select>
                    {application.reviewedBy && (
                      <span className="text-sm text-gray-500">
                        Просмотрено: {application.reviewedBy.firstName}{' '}
                        {application.reviewedBy.lastName}
                        {application.reviewedAt &&
                          ` (${new Date(application.reviewedAt).toLocaleDateString()})`}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    Заявка отправлена: {new Date(application.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

