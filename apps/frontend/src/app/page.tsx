import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Ընկերությունների ծառայությունների հարթակ
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Գտեք, համեմատեք և պատվիրեք բիզնես ծառայություններ մեկ հարթակում։
            B2B և B2C լուծումներ ձեր բիզնեսի համար։
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/catalog" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Դիտել կատալոգը
            </Link>
            <Link href="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Գրանցվել
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Ինչու՞ Tina Marketplace</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Հեշտ որոնում', desc: 'Ընդլայնված ֆիլտրացիա ըստ կատեգոริայի, գնի, վարկանիշի' },
              { icon: '📦', title: 'Package Configurator', desc: 'Ստեղծեք ձեր անհատական ծառայության փաթեթը' },
              { icon: '⭐', title: 'Վստահելի վարկանիշ', desc: 'Ստուգված գնումների վրա հիմնված վարկանիշային համակարգ' },
              { icon: '🔒', title: 'Անվտանգ վճարում', desc: 'Stripe-ով ապահով online վճարումներ' },
              { icon: '📊', title: 'Բիզնես վերլուծություն', desc: 'Ընկերությունների համար մանրամասն վիճակագրություն' },
              { icon: '🚀', title: 'Արագ ինտեգրացիա', desc: 'API-ի ինտեգրում CRM/ERP համակարգերի հետ' },
            ].map((f, i) => (
              <div key={i} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ձեր բիզնեսը հարթակում</h2>
          <p className="text-gray-600 mb-8">Ավելացրեք ձեր ծառայությունները և հասեք հազարավոր պոտենցիալ հաճախորդների</p>
          <Link href="/register?role=COMPANY" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Գրանցել ընկերությունը
          </Link>
        </div>
      </section>
    </main>
  );
}
