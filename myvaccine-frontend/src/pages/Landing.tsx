import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Landing.css';

const SLIDE_INTERVAL_MS = 6000;

const slides = [
  { id: 0, cta: 'Registre-se agora', image: '/landing-slide-1.png' },
  { id: 1, image: '/landing-slide-2.png' },
  { id: 2, image: '/landing-slide-3.png' },
  { id: 3, image: '/landing-slide-4.png' },
];

const sections = [
  {
    id: 'purpose',
    heading: 'Por que o MyVaccine foi criado?',
    title: 'Organizar e facilitar o cuidado com a vacinação',
    description:
      'O MyVaccine centraliza informações de vacinação em um ambiente digital seguro e simples. Ele foi criado para resolver a dificuldade de acesso, organização e confiança nos registros vacinais, ajudando usuários a cuidarem melhor da própria saúde com mais clareza e praticidade.',
    button: 'Registre-se',
    image: '/landing-section-purpose.png',
  },
  {
    id: 'location',
    heading: 'Localização & Acesso',
    title: 'Postos de vacinação mais perto de você',
    description:
      'Encontre unidades de saúde de forma rápida e intuitiva. O MyVaccine reúne informações de localização e disponibilidade de vacinas, ajudando você a planejar sua ida ao posto com mais segurança e menos deslocamentos desnecessários.',
    button: 'Criar conta',
    image: '/landing-section-location.png',
  },
  {
    id: 'benefits',
    heading: 'Funcionalidades & Benefícios',
    title: 'Mais controle para você e sua família',
    description:
      'Acompanhe sua carteira de vacinação de forma digital e organizada. Gerencie dependentes e consulte informações atualizadas em tempo real, garantindo mais tranquilidade no cuidado com a sua saúde e a de quem você ama.',
    button: 'Quero começar',
    image: '/landing-section-benefits.png',
  },
];

function Landing() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slidesCount = useMemo(() => slides.length, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slidesCount);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [slidesCount]);

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header__logo">
          {/* Logo em imagem (public/Name-Myvaccine.png) */}
          <img
            className="landing-header__logo-img landing-header__logo-img--stacked"
            src="/Name-Myvaccine.png"
            alt="MyVaccine"
          />
        </div>

        <nav className="landing-header__actions">
          <Link className="landing-button landing-button--ghost" to="/login">
            Entrar
          </Link>
          <Link className="landing-button landing-button--primary" to="/register">
            Registre-se
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-carousel">
          <div className="landing-carousel__track">
            <div
              className="landing-carousel__slides"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <article key={slide.id} className="landing-slide">
                  {/* Imagem do slide preenchendo tudo */}
                  <div className="landing-slide__image" aria-hidden="true">
                    <img src={slide.image} alt={`Slide ${index + 1}`} />
                  </div>

                  {index === 0 && (
                    <div className="landing-slide__cta">
                      <Link className="landing-button landing-button--primary" to="/register">
                        {slide.cta}
                      </Link>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="landing-carousel__bullets">
            {slides.map((slide) => (
              <button
                key={slide.id}
                type="button"
                className={`landing-carousel__bullet${
                  activeIndex === slide.id ? ' landing-carousel__bullet--active' : ''
                }`}
                onClick={() => setActiveIndex(slide.id)}
                aria-label={`Ir para o slide ${slide.id + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="landing-sections">
          {sections.map((section, index) => (
            <div key={section.id} className="landing-section">
              <h2>{section.heading}</h2>
              <div className={`landing-section__cards${index % 2 ? ' is-reverse' : ''}`}>
                <div className="landing-card landing-card--text">
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                  <Link className="landing-button landing-button--primary" to="/register">
                    {section.button}
                  </Link>
                </div>

                <div className="landing-card landing-card--media">
                  <div className="landing-card__image" aria-hidden="true">
                    <img src={section.image} alt={section.title} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="landing-footer">
<div className="landing-footer__brand">
  <strong className="landing-footer__title">MyVaccine</strong>

  <span className="landing-footer__subtitle">
    Desenvolvido por:
  </span>

  <div className="landing-footer__founders">
    <a
      href="https://www.linkedin.com/in/Hatus-Santos"
      target="_blank"
      rel="noopener noreferrer"
    >
      Hatus Luiz Rodrigues dos Santos
    </a>

    <span>•</span>

    <a
      href="https://www.linkedin.com/in/luiz-azevedo-dev"
      target="_blank"
      rel="noopener noreferrer"
    >
      Luiz Fernando Mendes de Azevedo
    </a>
  </div>
</div>
        <div className="landing-footer__links">
          <Link to="/register">Registre-se</Link>
          <Link to="/login">Entrar</Link>
        </div>
      </footer>
    </div>
  );
}

export default Landing;