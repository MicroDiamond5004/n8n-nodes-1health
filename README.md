# n8n-nodes-1health

An [n8n](https://n8n.io) community node for the [1Health](https://1health.io) API. It exposes patient
operations as drag-and-drop workflow steps, so operations staff can automate healthcare-record lookups without
writing backend code.

Built while working at 1health.io, a healthcare interoperability platform connecting diagnostic labs, health
systems, providers, and payors.

Published to npm as [`n8n-nodes-1health`](https://www.npmjs.com/package/n8n-nodes-1health).

## What it does

**Resource:** Patient
**Operation:** Find Patient — full-text search over people in a 1Health tenant, with `Limit` and `Page`
options for paginating results.

Credentials are stored in n8n's credential vault (a **1Health API** credential with an API key and a
configurable base URL), so keys never live inside individual nodes.

## Install

From the n8n UI: **Settings → Community Nodes → Install**, then enter `n8n-nodes-1health`.

Or with npm, in your n8n instance:

```bash
npm install n8n-nodes-1health
```

## Usage

1. Add a **1Health API** credential (API key + base URL, e.g. `https://demo.1health.io`).
2. Drop the **1Health** node into a workflow, choose the **Patient** resource and the **Find Patient**
   operation, and enter a search query.
3. Chain the results into any downstream node — Slack, a database, another API.

API reference: [docs.1health.io](https://docs.1health.io/)

## Development

```bash
npm install
npm run build      # compile TypeScript to dist/
npm run dev        # watch mode
npm run lint       # lint the node and credential definitions
```

CI runs on every push via GitHub Actions.

## License

MIT
