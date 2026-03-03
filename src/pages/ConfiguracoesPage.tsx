import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua clínica.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Clínica</CardTitle>
          <CardDescription>Informações gerais do estabelecimento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Clínica</Label>
            <Input defaultValue="Clinica Finezza" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(00) 0000-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input placeholder="Rua, número, bairro, cidade - UF" />
          </div>
          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Integração WhatsApp (n8n)</CardTitle>
          <CardDescription>Configure o webhook para envio de mensagens via n8n.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Webhook (n8n)</Label>
            <Input placeholder="https://seu-n8n.com/webhook/whatsapp" />
          </div>
          <p className="text-xs text-muted-foreground">
            Configure a URL do seu workflow n8n para habilitar envio de mensagens WhatsApp
            automatizadas para pacientes.
          </p>
          <div className="flex justify-end">
            <Button>Testar Conexão</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
