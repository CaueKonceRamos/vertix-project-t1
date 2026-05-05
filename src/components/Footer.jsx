import React from 'react'
import '../styles/Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p className="copyright">
            © {currentYear} <strong>Voltix - IoT</strong>. Todos os direitos reservados.
          </p>
        </div>

        <div className="footer-developers">
          <span className="developers-label">Desenvolvido por:</span>
          <div className="developers-names">
            <span className="developer-name">Beatriz de Abreu - C. Computação </span>
            <span className="developer-name">Cauê Valverde - C. Computação</span>
            <span className="developer-name">Gustavo de Jesus - C. Computação</span>
          </div>
        </div>

        <div className="footer-right">
          <p className="tagline">⚡ IoT Visual Editor</p>
        </div>
      </div>
    </footer>
  )
}
