# Supabase Setup

## 1. Create the table
Run the SQL from [supabase/projects_schema.sql](./supabase/projects_schema.sql) in the Supabase SQL editor.

## 2. Create an admin user
In Supabase Auth:
- create a user with your email and password
- use that account to log into `/admin/login.html`

## 3. Add your project credentials
Update [js/config.js](./js/config.js) with:
- `supabaseUrl`
- `supabaseAnonKey`

## 4. Connect the public portfolio
In the page where you want projects to appear, add:

```html
<section>
  <p data-project-status></p>
  <div data-project-list></div>
</section>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="./js/config.js"></script>
<script src="./js/projects.js"></script>
```

## 5. Access the admin
- Local: `/admin/login.html`
- Production: `https://your-site.netlify.app/admin/login.html`

After login, you will be redirected to `/admin/dashboard.html`.
