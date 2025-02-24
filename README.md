# GIS Application

## Layout

- `(main)`: For all kind

  - `/`: Welcome page
  - `/res/faq`: FAQ page. Can and should be done using \*.md files.
  - `/res/tos`: Terms of Service page. Can and should be done using \*.md files.
  - `/res/contact`: Contact page. Can and should be done using \*.md files.
  - `/res/privacy`: Privacy Policy page. Can and should be done using \*.md files.

- `(application)`: Application related

  - `/apply`: For new applications
  - `/apply/done`: For a confirmation message after applying
  - `/apply/:application_id`: For editing an application.

- `(admin)`: For admins
  - `/manage`: For admins to view new applications and react upon them
  - `/manage/:application_id`: For admins to view and edit a specific application

## Technologies

- React v18
- Tailwind v5
- DaisyUI v5
