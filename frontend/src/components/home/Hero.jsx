import { Link } from "react-router-dom";
import { BASE, scrollToSection } from "../../utils/scroll";

export default function Hero() {
  return (
      <section className="hero" id="experiencias">

              <div className="hero-content">

                  <div className="badge">
                      🤖 IA <span className="accent">+</span> 🌌 INMERSIÓN SIN LÍMITES
                  </div>

                  <h1>
                      La cabina portátil con
                      <span className="grad-purple">IA</span> que crea videojuegos
                      <span className="grad-lime">únicos</span> para ti
                  </h1>

                  <p className="hero-description">
                      <strong>DreamBox</strong> es una cabina portátil e inteligente que combina
                      inmersión total e inteligencia artificial para que vivas experiencias
                      de videojuegos creadas especialmente para ti.
                  </p>

                  <div className="hero-buttons">
                      <Link to="/catalogo" className="button-xp">🎮 Descubrir experiencias</Link>
                      <a href="#/" className="button-funtion" onClick={(e) => { e.preventDefault(); scrollToSection("como-funciona"); }}>Cómo funciona <span className="play-circle">▶</span></a>
                  </div>

              </div>

              <div className="hero-side">

                  <div className="hero-visual">
                      <img src={`${BASE}assets/dreambox-cabin.jpg`} alt="Cabina DreamBox con inmersión total e IA" />
                  </div>

                  <div className="stats">

                      <div className="stat-card c-purple">
                          <span className="icon">⏱️</span>
                          <div>
                              <strong>HORAS ILIMITADAS </strong>
                              <small>DE DIVERSIÓN GARANTIZADA</small>
                          </div>
                      </div>

                      <div className="stat-card c-cyan">
                          <span className="icon">🕶️</span>
                          <div>
                              <strong>INMERSIÓN TOTAL</strong>
                              <small>CON IA AVANZADA</small>
                          </div>
                      </div>

                      <div className="stat-card c-lime">
                          <span className="icon">🔋</span>
                          <div>
                              <strong>100% <span className="stat-label">PORTÁTIL</span></strong>
                              <small>LLEVA LA ACCIÓN A DONDE VAYAS</small>
                          </div>
                      </div>

                      <div className="stat-card c-purple">
                          <span className="icon">🥽</span>
                          <div>
                              <strong>REALIDAD VIRTUAL</strong>
                              <small>Y SALAS GAMING INTEGRADAS</small>
                          </div>
                      </div>

                  </div>

              </div>



          </section>
  );
}
