# OpenClaw and WhatsApp Contract

## Message Request

`POST /api/messages/send`

```json
{
  "to": "+5516992943215",
  "message": "Texto operacional"
}
```

## Delivery Policy

- Phone must be E.164.
- Free-form WhatsApp messages are allowed only inside the 24-hour customer-service window.
- Outside the window, use approved WhatsApp Business template messages.
- Every send must create or relate to an `ecosystem_messages` row when Supabase is enabled.
- Provider failures must become `ecosystem_events.status=failed` or an open task.

## OpenClaw Hub Payload

```json
{
  "kind": "manual-message",
  "title": "Mensagem manual do Ecossistema Whats",
  "contactName": "Contato WhatsApp",
  "contactPhone": "+5516992943215",
  "summary": "Mensagem",
  "send": true
}
```

## Status Transitions

`queued` -> `sent`

`queued` -> `failed`

`failed` -> retry -> `queued`
