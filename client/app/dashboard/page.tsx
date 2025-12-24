'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_MY_JOBS, GET_MY_COMPANY } from '@/lib/graphql/queries';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  const { data: companyData } = useQuery(GET_MY_COMPANY, {
    skip: !isAuthenticated || user?.role !== 'employer',
  });

  const { data: jobsData, loading } = useQuery(GET_MY_JOBS, {
    skip: !isAuthenticated || user?.role !== 'employer',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'employer') {
      router.push('/jobs');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'employer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center text-2xl font-bold text-primary-600">
              JobConnect
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/jobs" className="btn btn-secondary">
                Поиск вакансий
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
        <h1 className="text-3xl font-bold mb-8">Панель управления</h1>

        {!companyData?.myCompany && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Создайте свою компанию</h2>
            <p className="text-gray-600 mb-4">
              Вам нужно создать профиль компании перед размещением вакансий.
            </p>
            <Link href="/dashboard/company" className="btn btn-primary">
              Создать компанию
            </Link>
          </div>
        )}

        {companyData?.myCompany && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-2">{companyData.myCompany.name}</h2>
            <p className="text-gray-600 mb-4">{companyData.myCompany.description}</p>
            <Link href="/dashboard/company" className="btn btn-secondary">
              Редактировать компанию
            </Link>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Мои вакансии</h2>
          <Link href="/dashboard/jobs/new" className="btn btn-primary">
            Разместить вакансию
          </Link>
        </div>

        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <div className="space-y-4">
            {jobsData?.myJobs?.map((job: any) => (
              <div key={job.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                      <span>{job.location}</span>
                      {job.remote && <span>• Удалённо</span>}
                      <span>• {job.employmentType === 'full-time' ? 'Полная занятость' : job.employmentType === 'part-time' ? 'Частичная занятость' : job.employmentType === 'contract' ? 'Контракт' : 'Стажировка'}</span>
                      <span
                        className={`px-2 py-1 rounded ${
                          job.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {job.status === 'published' ? 'Опубликовано' : job.status === 'draft' ? 'Черновик' : job.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{job.description.substring(0, 200)}...</p>
                    <div className="text-sm text-gray-600">
                      <span>{job.applicationsCount} заявок</span>
                      <span className="mx-2">•</span>
                      <span>{job.viewsCount} просмотров</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="btn btn-secondary"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {jobsData?.myJobs?.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-gray-500 mb-4">Вы ещё не разместили ни одной вакансии.</p>
                <Link href="/dashboard/jobs/new" className="btn btn-primary">
                  Разместить первую вакансию
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

