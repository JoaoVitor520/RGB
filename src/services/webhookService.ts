const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string

interface WhatsAppMessage {
  to: string
  patientName: string
  message: string
  type: 'appointment_reminder' | 'appointment_confirmation' | 'custom'
}

export async function sendWhatsAppMessage(payload: WhatsAppMessage): Promise<{ success: boolean; error?: string }> {
  if (!N8N_WEBHOOK_URL) {
    console.warn('N8N Webhook URL não configurada. Configure VITE_N8N_WEBHOOK_URL no .env.local')
    return { success: false, error: 'Webhook URL não configurada' }
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: payload.to,
        name: payload.patientName,
        message: payload.message,
        type: payload.type,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}`)
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('Erro ao enviar mensagem WhatsApp:', message)
    return { success: false, error: message }
  }
}
