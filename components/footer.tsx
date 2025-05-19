import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                <rect width="20" height="5" x="2" y="2" rx="2" />
                <path d="M7 17v-5" />
                <path d="M11 17v-5" />
                <path d="M15 17v-5" />
                <path d="M19 17v-5" />
                <path d="M5 7v5" />
                <path d="M19 7v5" />
              </svg>
              <span className="font-bold text-xl">Catálogo Digital</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transforma la experiencia de tus clientes con un catálogo digital accesible mediante códigos QR.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-4">Producto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#benefits" className="text-sm text-muted-foreground hover:text-foreground">
                  Beneficios
                </Link>
              </li>
              <li>
                <Link href="/#prices" className="text-sm text-muted-foreground hover:text-foreground">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground">
                  Crear
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://www.softwans.com/blog/ia-productividad" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-muted-foreground hover:text-foreground">
                  Guías
                </Link>
              </li>
              <li>
                <Link href="https://www.softwans.com" className="text-sm text-muted-foreground hover:text-foreground">
                  Soporte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Términos
                </Link>
              </li>
              <li>
                <Link href="https://www.softwans.com" className="text-sm text-muted-foreground hover:text-foreground">
                  Softwans Corporations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Catálogo Digital by Softwans. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
