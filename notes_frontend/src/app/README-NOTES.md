Notes Frontend - Environment and Service Behavior

- The NotesService uses localStorage + in-memory state by default.
- If NG_APP_API_BASE or NG_APP_BACKEND_URL is defined, the service will try HTTP calls:
  - GET    {base}/notes
  - POST   {base}/notes
  - PUT    {base}/notes/:id
  - DELETE {base}/notes/:id
- Failures gracefully fallback to local state, ensuring the app works without backend.

Environment is read via import.meta.env and window.__env for flexibility.
