'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_JOBS } from '@/lib/graphql/queries';

export default function JobsPage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    remote: undefined as boolean | undefined,
  });

  const { data, loading, error } = useQuery(GET_JOBS, {
    variables: {
      filters: {
        ...filters,
        remote: filters.remote === undefined ? undefined : filters.remote,
      },
      limit: 20,
      offset: 0,
    },
  });

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Ошибка: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center text-2xl font-bold text-primary-600">
              JobConnect
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn btn-secondary">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Список вакансий</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Поиск
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="input"
                    placeholder="Название вакансии, ключевые слова..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Местоположение
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="input"
                    placeholder="Город, Страна"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.remote === true}
                      onChange={(e) =>
                        setFilters({ ...filters, remote: e.target.checked ? true : undefined })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Только удалённая работа</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="space-y-4">
              {data?.jobs?.map((job: any) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="card hover:shadow-lg transition-shadow block"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-primary-600 font-medium mb-2">{job.company.name}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                        <span>{job.location}</span>
                        {job.remote && <span>• Удалённо</span>}
                        <span>• {job.employmentType === 'full-time' ? 'Полная занятость' : job.employmentType === 'part-time' ? 'Частичная занятость' : job.employmentType === 'contract' ? 'Контракт' : 'Стажировка'}</span>
                        <span>• {job.experienceLevel === 'junior' ? 'Junior' : job.experienceLevel === 'middle' ? 'Middle' : job.experienceLevel === 'senior' ? 'Senior' : 'Lead'}</span>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills.slice(0, 5).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {job.salaryMin && (
                      <div className="ml-4 text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${job.salaryMin.toLocaleString()}
                          {job.salaryMax && ` - $${job.salaryMax.toLocaleString()}`}
                        </p>
                        <p className="text-sm text-gray-500">{job.currency}</p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}

              {data?.jobs?.length === 0 && (
                <div className="card text-center py-12">
                  <p className="text-gray-500">Вакансии не найдены. Попробуйте изменить фильтры.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

