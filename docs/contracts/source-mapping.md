# Source Mapping Matrix

| Source | Event kinds | Contact fields | Task fields | Notes |
| --- | --- | --- | --- | --- |
| `webflow` | `form_submission`, `site_publish`, `ecomm_new_order`, `collection_item_created`, `collection_item_changed` | form name, email, phone | follow-up for forms/orders | Requires `x-webflow-timestamp` and `x-webflow-signature`. |
| `fireflies` | `meeting_summary`, `transcript_ready`, `action_items_ready` | attendees | action items, decisions | Store full transcript only when explicitly needed. |
| `carta` | `contact_updated`, `deal_created`, `relationship_note`, `stage_changed` | contact/company/deal owner | follow-up and stage tasks | Prefer one-way import until conflict rules are approved. |
| `openclaw` | `agent_result`, `message_failed`, `message_sent`, `heartbeat` | channel peer | failed delivery or agent task | Maps to episodic/procedural memory. |
| `whatsapp` | `message_received`, `message_sent`, `template_required` | E.164 phone | template approval/follow-up | Respect 24h free-form window. |
| `injetaveis` | `secretario-operacional`, `estoque-alerta`, `paciente-criado` | patient/secretary | operational tasks | Current clinic dashboard source. |

## Contact Key Priority

1. E.164 phone.
2. Email.
3. Provider contact id.
4. `source:name` fallback.

## Merge Rules

- Same source and same contact key: update existing contact.
- Phone match across sources: candidate for merge, not automatic deletion.
- More recent `last_seen_at` wins for display name unless manually pinned later.
