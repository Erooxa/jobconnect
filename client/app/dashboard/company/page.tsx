'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GET_MY_COMPANY, CREATE_COMPANY } from '@/lib/graphql/queries';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect } from 'react';

const companySchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  description: z.string().min(50, 'Описание должно содержать минимум 50 символов'),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().min(1, 'Отрасль обязательна'),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  location: z.string().min(1, 'Местоположение обязательно'),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function CompanyPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const { data, loading } = useQuery(GET_MY_COMPANY, {
    skip: !isAuthenticated || user?.role !== 'employer',
  });
  const [createCompany, { loading: submitting }] = useMutation(CREATE_COMPANY);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    values: data?.myCompany
      ? {
          name: data.myCompany.name,
          description: data.myCompany.description,
          website: data.myCompany.website || '',
          industry: data.myCompany.industry,
          size: data.myCompany.size,
          location: data.myCompany.location,
          foundedYear: data.myCompany.foundedYear,
        }
      : undefined,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'employer') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (formData: CompanyForm) => {
    try {
      await createCompany({
        variables: { input: formData },
        refetchQueries: [{ query: GET_MY_COMPANY }],
      });
      alert('Компания успешно создана!');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Не удалось создать компанию');
    }
  };

  if (!isAuthenticated || user?.role !== 'employer') {
    return null;
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Загрузка...</div>;

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
        <h1 className="text-3xl font-bold mb-8">
          {data?.myCompany ? 'Редактировать компанию' : 'Создать компанию'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название компании *</label>
            <input {...register('name')} type="text" className="input" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание * (минимум 50 символов)
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className="input"
              placeholder="Опишите вашу компанию..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Веб-сайт</label>
            <input {...register('website')} type="url" className="input" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Отрасль *</label>
              <input {...register('industry')} type="text" className="input" placeholder="Технологии" />
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Размер *</label>
              <select {...register('size')} className="input">
                <option value="startup">Стартап</option>
                <option value="small">Маленькая</option>
                <option value="medium">Средняя</option>
                <option value="large">Большая</option>
                <option value="enterprise">Корпорация</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение *</label>
              <input
                {...register('location')}
                type="text"
                className="input"
                placeholder="Город, Страна"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Год основания</label>
              <input
                {...register('foundedYear', { valueAsNumber: true })}
                type="number"
                className="input"
                placeholder="2020"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Сохранение...' : data?.myCompany ? 'Обновить компанию' : 'Создать компанию'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

