import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Términos y Servicios</CardTitle>
            <p className="text-gray-600 mt-2">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
          </CardHeader>

          <CardContent className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceptación de los Términos</h2>
              <p className="text-gray-700 leading-relaxed">
                Al acceder y utilizar nuestro servicio de catálogo digital, usted acepta estar sujeto a estos términos y
                servicios. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descripción del Servicio</h2>
              <p className="text-gray-700 leading-relaxed">
                Nuestro servicio permite a los usuarios crear y gestionar catálogos digitales con códigos QR para
                restaurantes y negocios. Proporcionamos herramientas para la creación de menús, gestión de pedidos y
                sistemas de fidelización.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Registro de Cuenta</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Para utilizar nuestro servicio, debe registrarse proporcionando información precisa y completa. Usted es
                responsable de:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Mantener la confidencialidad de su contraseña</li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Uso Aceptable</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Usted se compromete a no utilizar nuestro servicio para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Actividades ilegales o fraudulentas</li>
                <li>Violar derechos de propiedad intelectual</li>
                <li>Transmitir contenido ofensivo o dañino</li>
                <li>Interferir con el funcionamiento del servicio</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Privacidad y Datos</h2>
              <p className="text-gray-700 leading-relaxed">
                Recopilamos y procesamos sus datos personales de acuerdo con nuestra Política de Privacidad. Al utilizar
                nuestro servicio, usted consiente la recopilación y uso de información según se describe en dicha
                política.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Pagos y Facturación</h2>
              <p className="text-gray-700 leading-relaxed">
                Los servicios premium están sujetos a tarifas. Los pagos se procesan de forma segura y las tarifas se
                cobran según el plan seleccionado. Las cancelaciones y reembolsos están sujetos a nuestras políticas
                específicas.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 leading-relaxed">
                Nuestro servicio se proporciona "tal como está". No garantizamos que el servicio sea ininterrumpido o
                libre de errores. Nuestra responsabilidad se limita al monto pagado por el servicio en los últimos 12
                meses.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modificaciones</h2>
              <p className="text-gray-700 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán
                en vigor inmediatamente después de su publicación en nuestro sitio web.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Terminación</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso, por cualquier motivo,
                incluyendo el incumplimiento de estos términos.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contacto</h2>
              <p className="text-gray-700 leading-relaxed">
                Si tiene preguntas sobre estos términos y servicios, puede contactarnos a través de nuestros canales de
                soporte oficial.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
