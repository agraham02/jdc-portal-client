# Jackson Development Management Portal

Objective: Develop a production-ready, modular REST API using NestJS and MongoDB for the Jackson Development Company (JDC) Management Portal. The API will manage employees, vendors, and procurement contracts, incorporating Role-Based Access Control (RBAC) to ensure secure and appropriate access for different user roles: Admin, Employee, and Vendor.

## Authentication & Authorization
JWT Authentication:

Implement access and refresh tokens for secure session management.

Securely store refresh tokens and handle token rotation.

Role-Based Access Control (RBAC):

Define roles: Admin, Employee, Vendor (coming soon, Housing Tenant).

Utilize custom decorators and guards to enforce role permissions.

Consider role hierarchies if applicable (e.g., Admin > Employee > Vendor).

## Guards & Decorators:

Create @Roles() decorator to specify required roles for endpoints.

Implement RolesGuard to check user roles against required roles.

Optionally, develop a PermissionsGuard for fine-grained access control.

## Public Routes

Designate certain routes (e.g., vendor registration) as public using a @Public() decorator.

## User Management Endpoints

POST /auth/register – Register a new user with optional role assignment.

POST /auth/login – Authenticate user and issue JWT tokens.

GET /auth/me – Retrieve authenticated user's profile.

PATCH /auth/update-password – Allow users to change their password.

POST /auth/logout – Invalidate refresh token and logout user.

## Employee Management Endpoints

GET /employees – List all employees (Admin only).

GET /employees/:id – Retrieve employee profile (Admin or self).

POST /employees – Create a new employee (Admin only).

PATCH /employees/:id – Update employee information (Admin or self).

DELETE /employees/:id – Remove an employee (Admin only).

## Vendor Management Endpoints

GET /vendors – List all vendors (Admin and Employee).

GET /vendors/:id – Retrieve vendor profile (Admin, Employee, or Vendor self).

POST /vendors – Register a new vendor (Public or Admin).

PATCH /vendors/:id – Update vendor information (Vendor self or Admin).

DELETE /vendors/:id – Archive a vendor (Admin only).

## Procurement Contracts Endpoints

GET /contracts – List all active/open contracts (Admin and Employee).

POST /contracts – Create a new contract (Admin only).

PATCH /contracts/:id – Update contract details (Admin only).

POST /contracts/:id/apply – Vendor applies for a contract (Vendor only).

## Shared Features & Best Practices

### Validation

Use class-validator and class-transformer for DTO validation.

Ensure all incoming data is validated and sanitized.

## Error Handling

Implement global exception filters for consistent error responses.

Define custom exceptions for domain-specific errors.

### Pagination & Filtering

Implement pagination and filtering for list endpoints.

Use query parameters to control pagination (page, limit) and filtering criteria.

## Logging & Monitoring

Integrate a logging library (e.g., pino) for structured logging.

Monitor application performance and errors.

## User Stories

### Admin User Stories

#### User Account Management

- As an Admin, I want to approve or reject newly registered employee and vendor accounts so that only authorized users gain access to the system.

- As an Admin, I want to assign roles to users during account creation or modification so that each user has appropriate access rights.

#### Employee and Vendor Oversight

- As an Admin, I want to view a list of all employees and vendors so that I can monitor and manage user information effectively.

- As an Admin, I want to edit or deactivate employee and vendor profiles so that I can maintain up-to-date records.

#### Contract Management

- As an Admin, I want to create new procurement contracts so that vendors can bid on upcoming projects.

- As an Admin, I want to review and approve or reject vendor bids on contracts so that suitable vendors are selected for projects.

#### System Monitoring and Reporting

- As an Admin, I want to generate reports on user activity and contract statuses so that I can assess system usage and project progress.

### Employee User Stories

#### Account Access

- As an Employee, I want to register for a new account so that I can access the management portal.

- As an Employee, I want to log in to my account so that I can perform my job-related tasks.

#### Profile Management

- As an Employee, I want to view and update my personal profile so that my information remains current.

#### Access to Resources

- As an Employee, I want to access HR-related links and documents so that I can stay informed about company policies and benefits.

#### Contract Interaction

- As an Employee with appropriate permissions, I want to view procurement contracts so that I can assist in the vendor selection process.

### Vendor User Stories

#### Account Access

- As a Vendor, I want to register for a new account so that I can participate in procurement opportunities.

- As a Vendor, I want to log in to my account so that I can manage my bids and profile.

#### Profile Management

- As a Vendor, I want to view and update my company profile so that potential clients have accurate information about my services.

#### Contract Bidding

- As a Vendor, I want to view open procurement contracts so that I can identify opportunities to bid on.

- As a Vendor, I want to submit bids for contracts so that I can secure new business.

- As a Vendor, I want to withdraw my bid before the deadline so that I can manage my commitments effectively.

### Bid Status Tracking

- As a Vendor, I want to track the status of my submitted bids so that I can stay informed about potential projects.

## Documentation

Utilize Swagger (@nestjs/swagger) to generate interactive API documentation.

Keep documentation up-to-date with API changes.

## Architecture & Development Guidelines

Use modern instrustry standards and practices

Modular Architecture:

Organize the code into logical folders so that it has a modular and clean project folder structure

Organize code into modules: AuthModule, UsersModule, EmployeesModule, VendorsModule, ContractsModule.

Each module should encapsulate its own controllers, services, and entities.

Environment Configuration:

Manage configuration using @nestjs/config.

Store sensitive information (e.g., database URI, JWT secret) in environment variables.

Database Integration:

Use @nestjs/mongoose to integrate MongoDB with Mongoose ODM.

Define schemas and models for each entity.

Testing:

Write unit tests for services and guards.

Implement integration tests for controllers and critical workflows.

NestJS says this: Keep your test files located near the classes they test. Testing files should have a .spec or .test suffix.

⚙️ Technical Stack
Framework: NestJS

Database: MongoDB with Mongoose

Authentication: JWT (Access & Refresh Tokens)

Validation: class-validator, class-transformer

Documentation: Swagger (@nestjs/swagger)

Testing: Jest

Logging: Pino

Configuration: @nestjs/config

🧪 Functional Requirements
Secure Password Storage:

Hash passwords using bcrypt before storing them in the database.

Rate Limiting:

Implement rate limiting on sensitive endpoints (e.g., login, registration) to prevent brute-force attacks.

Access Control:

Ensure users can only access resources permitted by their role.

Implement guards to enforce access restrictions.

Data Integrity:

Validate and sanitize all incoming data.

Handle duplicate entries and enforce unique constraints where necessary.