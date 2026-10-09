# Brian Kelley | Python Developer Portfolio

A simple developer portfolio showcasing my Python, Django, backend development, REST API, database, testing, and web development experience.

## About Me

I am a self-taught Python developer focused on backend and web application development. I enjoy turning practical problems into working software and building projects with clean code, reliable data handling, and well-structured backend systems.

I have hands-on experience with Python, Django, Django REST Framework, PostgreSQL, SQLite, Docker, REST APIs, automated testing, and GitHub Actions.

I am currently seeking an entry-level Python developer position where I can contribute to real projects, learn from experienced developers, and continue improving my software development skills.

## Technical Skills

### Languages and Frameworks

- Python
- SQL
- Django
- Django REST Framework
- HTMX
- HTML
- CSS
- Django Templates
- Tailwind CSS

### Databases and APIs

- PostgreSQL
- SQLite
- Django ORM
- REST APIs
- JWT Authentication
- OpenAPI

### Development Tools

- Git
- GitHub
- Docker
- Docker Compose
- pytest
- Ruff
- GitHub Actions

## Projects

### TaskForge

Team task management application built with Python, Django, PostgreSQL, HTMX, and Docker.

Repository:

https://github.com/briankelley-it/TaskForge

Features include:

- Kanban task management
- Task assignments
- Drag and drop task status updates
- Project invitations
- Comments
- Task filtering
- CSV export
- Project membership and owner permissions
- Database transactions
- Row locking for task ordering
- Automated permission and application tests
- Query count testing
- GitHub Actions CI
- PostgreSQL testing
- Deployment checks

### LedgerAPI

Expense tracking REST API built with Python, Django REST Framework, PostgreSQL, JWT authentication, and OpenAPI.

Repository:

https://github.com/briankelley-it/LedgerAPI

Features include:

- Expense categories
- Transactions
- Monthly budgets
- Spending summaries
- Filtering
- Pagination
- JWT authentication
- User-specific data access
- Decimal-based financial calculations
- Database constraints
- SQL subqueries for budget calculations
- OpenAPI documentation
- PostgreSQL automated tests
- Schema validation
- 90% test coverage requirement
- Docker image builds
- GitHub Actions CI

## Running the Portfolio

This portfolio is a static website built with HTML and CSS.

No Node.js, npm, package.json, or dependency installation is required.

Download or clone the repository and open:

    index.html

in your browser.

## Optional Local Python Server

If Python 3.10 or newer is installed, you can run the included development server:

    python server.py

On Windows you can also use:

    py server.py

Then open:

    http://127.0.0.1:8000

To use another port:

    python server.py --port 8080

The local server can provide optional development endpoints such as:

    GET /api/projects

    GET /api/health

The Python server is not required for the portfolio website itself.

## Publishing

The portfolio can be hosted directly with GitHub Pages because the website does not require a build process.

For static hosting, the required files are:

- index.html
- styles.css
- assets folder

The Python server and projects.json are optional and are not required for GitHub Pages.

Because this project does not use Node.js or npm, a GitHub Actions workflow should not require npm install, npm ci, package-lock.json, yarn.lock, or actions/setup-node unless Node.js functionality is added later.

## GitHub

https://github.com/briankelley-it

## Contact

Brian Kelley

Python Developer | Backend and Web Applications

Cypress, Texas

Email: briankelley19901@gmail.com

GitHub: https://github.com/briankelley-it

## Live Demos

The live demos are static snapshots, because GitHub Pages cannot run Django:

- `thistledown/` is built with `python manage.py export_static` from the ThistledownHomes repository.
- `taskforge/` is built with `tools/build_taskforge_demo.py`, which seeds the demo account and saves every page and HTMX fragment. Browsing works, and changes show a notice instead of saving.
- `ledgerapi/` is built with `tools/build_ledgerapi_demo.py`, which runs the real API, records a response for every endpoint, and serves Swagger UI where "Try it out" returns those recordings.

Each script explains its usage at the top of the file.
