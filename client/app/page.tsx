import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                JobConnect
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
              >
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Найдите работу мечты
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Свяжитесь с ведущими работодателями и откройте возможности, соответствующие вашим навыкам
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/jobs" className="btn btn-primary text-lg px-8 py-3">
              Поиск вакансий
            </Link>
            <Link href="/register?role=employer" className="btn btn-secondary text-lg px-8 py-3">
              Разместить вакансию
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="card text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Поиск вакансий</h3>
            <p className="text-gray-600">
              Просматривайте тысячи вакансий от ведущих компаний
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-semibold mb-2">Легко откликайтесь</h3>
            <p className="text-gray-600">
              Откликайтесь на вакансии в несколько кликов и отслеживайте свои заявки
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Развивайте карьеру</h3>
            <p className="text-gray-600">
              Связывайтесь с работодателями и выводите свою карьеру на новый уровень
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

