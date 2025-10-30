
# CRM Features TO DO List

This document outlines the features to be implemented in the Nuvora CRM.

## Core Features

- [ ] **Organization Management:**
    - [x] Create Organization
    - [ ] Read Organization Settings
    - [ ] Update Organization Plan
    - [ ] Soft delete an Organization
- [ ] **User Management:**
    - [ ] User Authentication (Login/Logout)
    - [ ] Invite New Users
    - [ ] List Users in an Organization
    - [ ] User Roles and Permissions (OWNER, ADMIN, MANAGER, SALES, SUPPORT)
- [ ] **Customer Management:**
    - [ ] Create Customer
    - [ ] Read Customer Details
    - [ ] Update Customer Information
    - [ ] Transfer Customer Ownership
    - [ ] Soft delete a Customer
- [ ] **Contact Management:**
    - [ ] Create Contact for a Customer
    - [ ] Read Contact Details
    - [ ] Update Contact Information
    - [ ] Set Primary Contact
- [ ] **Interaction Logging:**
    - [ ] Log Interactions (Email, Call, Meeting, Note, Task, WhatsApp)
    - [ ] View Customer Interaction Timeline
- [ ] **Deal/Opportunity Management:**
    - [ ] Create Deal
    - [ ] Update Deal Stage
    - [ ] View Deal Pipeline
    - [ ] Log Lost Reasons
- [ ] **Task Management:**
    - [ ] Create Task
    - [ ] View "My Tasks"
    - [ ] Mark Task as Complete
- [ ] **Product Catalog:**
    - [ ] Create Product
    - [ ] Read Product List
- [ ] **Deal-Product Association:**
    - [ ] Add Product to Deal
    - [ ] Read Products in a Deal

## API Endpoints

- [ ] **Auth:**
    - [ ] `POST /auth/register`
    - [ ] `POST /auth/login`
- [ ] **Organization:**
    - [ ] `GET /organization/settings`
    - [ ] `PUT /organization/upgrade`
- [ ] **Users:**
    - [ ] `POST /users`
    - [ ] `GET /users`
- [ ] **Customers:**
    - [ ] `POST /customers`
    - [ ] `GET /customers`
    - [ ] `PUT /customers/:id`
    - [ ] `PUT /customers/:id/transfer`
- [ ] **Contacts:**
    - [ ] `POST /customers/:customerId/contacts`
    - [- [ ] GET /customers/:customerId/contacts`
- [ ] **Interactions:**
    - [ ] `POST /interactions`
    - [ ] `GET /customers/:id/timeline`
- [ ] **Deals:**
    - [ ] `POST /deals`
    - [ ] `PUT /deals/:id/stage`
    - [ ] `GET /deals/pipeline`
- [ ] **Tasks:**
    - [ ] `POST /tasks`
    - [ ] `GET /tasks/my`
    - [ ] `PUT /tasks/:id/complete`
- [ ] **Products:**
    - [ ] `POST /products`
    - [ ] `GET /products`
- [ ] **DealProducts:**
    - [ ] `POST /deals/:dealId/products`
    - [ ] `GET /deals/:dealId/products`

## Security

- [ ] Implement middleware to check for `organizationId` on all relevant routes.
- [ ] Enforce user role permissions for all actions.

